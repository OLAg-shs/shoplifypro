const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const Store = require('../models/Store');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all agents for a store
// @route   GET /api/agents/store/:storeId
// @access  Private (Store owner)
router.get('/store/:storeId', protect, async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if user owns the store
    if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view agents for this store' });
    }
    
    const agents = await Agent.find({ store: req.params.storeId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(agents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create agent
// @route   POST /api/agents
// @access  Private (Store owner)
router.post('/', protect, async (req, res) => {
  try {
    const { userId, commissionRate } = req.body;
    
    // Get user's store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(400).json({ message: 'You need to create a store first' });
    }
    
    // Check if user to be agent exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already an agent for this store
    const existingAgent = await Agent.findOne({ user: userId, store: store._id });
    if (existingAgent) {
      return res.status(400).json({ message: 'User is already an agent for this store' });
    }
    
    const agent = await Agent.create({
      user: userId,
      store: store._id,
      commissionRate: commissionRate || 0.05 // 5% default
    });
    
    res.status(201).json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private (Store owner)
router.put('/:id', protect, async (req, res) => {
  try {
    let agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Get user's store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(400).json({ message: 'Store not found' });
    }
    
    // Check if user owns the store
    if (store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this agent' });
    }
    
    // Check if agent belongs to user's store
    if (agent.store.toString() !== store._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this agent' });
    }
    
    const { commissionRate, isActive } = req.body;
    
    agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { 
        commissionRate: commissionRate !== undefined ? commissionRate : agent.commissionRate,
        isActive: isActive !== undefined ? isActive : agent.isActive
      },
      { new: true, runValidators: true }
    );
    
    res.json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private (Store owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Get user's store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(400).json({ message: 'Store not found' });
    }
    
    // Check if user owns the store
    if (store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this agent' });
    }
    
    // Check if agent belongs to user's store
    if (agent.store.toString() !== store._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this agent' });
    }
    
    await agent.remove();
    
    res.json({ message: 'Agent removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get agent earnings
// @route   GET /api/agents/:id/earnings
// @access  Private
router.get('/:id/earnings', protect, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .populate('user', 'name email')
      .populate('store', 'name');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Check if user is the agent, store owner, or admin
    if (agent.user._id.toString() !== req.user._id.toString() && 
        agent.store.owner.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these earnings' });
    }
    
    // In a real app, we would calculate earnings from completed orders
    // For now, we'll return the stored values
    res.json({
      totalSales: agent.totalSales,
      totalCommission: agent.totalCommission,
      commissionRate: agent.commissionRate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;