const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get agents by store
// @route   GET /api/agents/store/:storeId
// @access  Public
router.get('/store/:storeId', async (req, res) => {
  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*, users(name, email)')
      .eq('store_id', req.params.storeId)
      .eq('is_active', true);
    
    if (error) throw error;
    res.json(agents);
  } catch (error) {
    console.error("GET AGENTS ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Become an agent for a store
// @route   POST /api/agents/apply/:storeId
// @access  Private (Buyer/Agent role)
router.post('/apply/:storeId', protect, async (req, res) => {
  try {
    // Check if store exists
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', req.params.storeId)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if already an agent for this store
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('store_id', req.params.storeId)
      .single();

    if (existingAgent) {
      return res.status(400).json({ message: 'Already an agent for this store' });
    }
    
    const { data: agent, error } = await supabase
      .from('agents')
      .insert([
        {
          user_id: req.user.id,
          store_id: req.params.storeId,
          commission_rate: 0.05, // Default 5%
          is_active: true
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json(agent);
  } catch (error) {
    console.error("APPLY AGENT ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;