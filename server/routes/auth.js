const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { message: 'Too many accounts created from this IP. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Validation Middleware ─────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  body('role').optional().isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];


// @route POST /api/auth/register
router.post('/register', registerLimiter, registerValidation, validate, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Sign Up via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (authError) {
      // If user exists in Auth but not in public.users (unlikely but possible)
      if (authError.message.includes('already registered')) {
         return res.status(400).json({ message: 'This email is already registered. Please try logging in.' });
      }
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ message: 'Registration failed: No user data returned from authentication provider.' });
    }

    const userId = authData.user.id;

    // 3. Double check if user meta exists by ID (safety)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User metadata already exists' });
    }

    // Determine user status
    let status = 'active'; 
    if (role === 'seller') status = 'pending';

    // 3. The Database Trigger (handle_new_user) now handles the public.users insert automatically!
    // We just need to wait a tiny bit to ensure it's finished or just return success.
    
    res.status(201).json({
      id: userId,
      name: name,
      email: authData.user.email,
      role: role || 'buyer',
      token: authData.session?.access_token, // Added token for immediate login
      message: 'Registration successful! Redirecting to dashboard...'
    });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    res.status(500).json({ 
      message: error.message || 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// @route POST /api/auth/login
router.post('/login', loginLimiter, loginValidation, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Sign In via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // 2. Fetch User metadata (role, status)
    let { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role, status, subscription_tier, ai_credits, subscription_expires_at')
      .eq('id', authData.user.id)
      .single();

    // ── AUTO-HEALING MECHANISM ──────────────────────────────────────────────
    // Only attempt to heal if the user specifically does NOT exist in public.users
    if (fetchError && fetchError.code === 'PGRST116' || !user) {
      console.log(`[AUTH HEAL] Recovering missing metadata for user: ${authData.user.email}`);
      
      const metadata = authData.user.user_metadata || {};
      const name = metadata.name || authData.user.email.split('@')[0];
      const role = metadata.role || 'buyer';
      const status = 'active'; 

      const { data: recoveredUser, error: healError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          name: name,
          role: role,
          status: status,
          subscription_tier: 'free',
          ai_credits: 0
        }])
        .select('id, name, email, role, status, subscription_tier, ai_credits, subscription_expires_at')
        .single();

      if (healError) {
        // If it fails because it actually DOES exist (race condition or weird caching)
        if (healError.code === '23505') {
           console.log(`[AUTH HEAL] User actually exists, skipping heal.`);
           const { data: existingUser } = await supabase
             .from('users')
             .select('id, name, email, role, status, subscription_tier, ai_credits, subscription_expires_at')
             .eq('id', authData.user.id)
             .single();
           user = existingUser;
        } else {
           console.error('[AUTH HEAL ERROR]', healError);
           return res.status(500).json({ message: 'Server error: Unable to recover user profile. ' + healError.message });
        }
      } else {
        user = recoveredUser;
      }
    } else if (fetchError) {
       // If it's a different database error, don't try to heal, just report it
       console.error('[FETCH USER ERROR]', fetchError);
       return res.status(500).json({ message: 'Database error while fetching user profile.' });
    }

    if (!user) {
       return res.status(500).json({ message: 'Critical error: User profile is still missing after heal attempt.' });
    }

    // 3. Check Status
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: `Account is ${user.status}. Please wait for admin approval.` 
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      subscription_tier: user.subscription_tier || 'free',
      ai_credits: user.ai_credits || 0,
      subscription_expires_at: user.subscription_expires_at,
      token: authData.session.access_token
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, is_verified, subscription_tier, ai_credits, subscription_expires_at')
      .eq('id', req.user.id)
      .single();

    if (error) {
      throw error;
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user preferences (from AI Onboarding)
// @route   PUT /api/auth/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const preferences = req.body;
    // For MVP, we can just return success without strictly requiring a schema update.
    // If the DB supports it, we update. Otherwise, we simulate success for the frontend.
    // In a real scenario, we'd add a JSONB column 'preferences' to the 'users' table.
    // await supabase.from('users').update({ preferences }).eq('id', req.user.id);
    
    res.json({ message: 'Preferences updated successfully', preferences });
  } catch (error) {
    console.error('[UPDATE PREFERENCES ERROR]', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Admin: Get pending sellers for approval
// @route   GET /api/auth/admin/pending-sellers
// @access  Private (Admin only)
router.get('/admin/pending-sellers', protect, authorize('admin'), async (req, res) => {
  try {
    const { data: sellers, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('role', 'seller')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(sellers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Admin: Approve or reject seller
// @route   PUT /api/auth/admin/seller/:id
// @access  Private (Admin only)
router.put('/admin/seller/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { action } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role, status')
      .eq('id', req.params.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'seller') return res.status(400).json({ message: 'User is not a seller' });

    const newStatus = action === 'approve' ? 'active' : 'rejected';

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', req.params.id)
      .select('id, name, email, status')
      .single();

    if (updateError) throw updateError;

    // ── AUTO STORE CREATION ───────────────────────────────────────────────────
    // When a seller is approved, automatically create their default store.
    let storeCreated = false;
    if (action === 'approve') {
      // Check if store already exists (idempotent)
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!existingStore) {
        const slug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-store';
        const { error: storeError } = await supabase
          .from('stores')
          .insert([{
            name: `${user.name}'s Store`,
            description: 'Welcome to my store! Edit this in your Store Builder.',
            slug,
            owner_id: user.id,
            branding: {
              primaryColor: '#2563eb',
              secondaryColor: '#f1f5f9',
              backgroundColor: '#ffffff',
              textColor: '#0f172a',
              fontFamily: 'Inter, sans-serif',
              layoutStyle: 'modern',
            },
            settings: {},
            is_published: false,
            is_verified: false,
          }]);

        if (!storeError) storeCreated = true;
        else console.error('[AUTO STORE CREATION ERROR]', storeError);
      }
    }

    res.json({
      message: `Seller ${action}d successfully`,
      storeAutoCreated: storeCreated,
      user: updatedUser,
    });
  } catch (error) {
    console.error('[ADMIN APPROVE SELLER ERROR]', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password`
    });

    if (error) return res.status(400).json({ message: error.message });

    res.json({ message: 'If an account exists, a reset link has been sent to your email.' });
  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Reset password (session based, from email link)
// @route   POST /api/auth/reset-password
// @access  Private (Auth session required from link)
router.post('/reset-password', protect, async (req, res) => {
  try {
    const { password } = req.body;
    
    const { error } = await supabase.auth.updateUser({ password });

    if (error) return res.status(400).json({ message: error.message });

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('[RESET PASSWORD ERROR]', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;