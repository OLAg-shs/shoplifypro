const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

    // Sanity check for environment configuration
    if (!supabase) {
      return res.status(500).json({ 
        message: 'Database Configuration Error', 
        error: 'Supabase client is not initialized. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel settings.' 
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        message: 'Security Configuration Error', 
        error: 'JWT_SECRET is not defined in Vercel settings.' 
      });
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw fetchError;
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine user status based on role
    let status = 'active'; // Default for buyers
    if (role === 'seller') {
      status = 'pending'; // Sellers need admin approval
    }

    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password: hashedPassword,
          role: role || 'buyer',
          status,
          is_verified: false
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 🔐 SECURITY: Pending sellers do NOT receive a JWT on registration.
    // They must wait for admin approval before they can log in.
    if (newUser.status === 'pending') {
      return res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'pending',
        message: 'Registration successful! Your seller account is pending admin approval. You will be notified once approved.',
      });
    }

    // Buyers get immediate access with a token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      token,
    });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route POST /api/auth/login
router.post('/login', loginLimiter, loginValidation, validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user with only needed fields (password for compare, role for JWT)
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, password, role, status')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: `Account is ${user.status}. Please wait for admin approval.` 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, is_verified')
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

module.exports = router;