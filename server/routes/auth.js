const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
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

    // Create JWT token
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      token
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message,
      details: error.details || 'No details'
    });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
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
    const { action } = req.body; // 'approve' or 'reject'
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }
    
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a seller' });
    }
    
    const updateData = {};
    if (action === 'approve') {
      updateData.status = 'active';
    } else {
      updateData.status = 'rejected';
    }
    
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({ 
      message: `Seller ${action}ed successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;