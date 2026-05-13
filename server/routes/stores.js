const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('is_published', true)
      .eq('is_verified', true);
    
    if (error) throw error;
    res.json(stores);
  } catch (error) {
    console.error("GET STORES ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*, products(*)')
      .eq('id', req.params.id)
      .single();
    
    if (error || !store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(store);
  } catch (error) {
    console.error("GET STORE BY ID ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create store
// @route   POST /api/stores
// @access  Private (Seller only)
router.post('/', protect, authorize('seller'), async (req, res) => {
  try {
    const { name, description, branding, settings } = req.body;
    
    // Check if user already has a store
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (existingStore) {
      return res.status(400).json({ message: 'You already have a store' });
    }
    
    const { data: store, error } = await supabase
      .from('stores')
      .insert([
        {
          name,
          description,
          owner_id: req.user.id,
          branding: branding || undefined,
          settings: settings || undefined,
          is_published: false,
          is_verified: false
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(store);
  } catch (error) {
    console.error("CREATE STORE ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (Owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { data: store, error: fetchError } = await supabase
      .from('stores')
      .select('owner_id')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError || !store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    if (store.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { name, description, branding, settings, is_published } = req.body;
    
    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update({ name, description, branding, settings, is_published })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    res.json(updatedStore);
  } catch (error) {
    console.error("UPDATE STORE ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;