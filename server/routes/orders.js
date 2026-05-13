const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Store = require('../models/Store');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get user's orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images'
      })
      .populate({
        path: 'store',
        select: 'name'
      })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'items.product',
        select: 'name price images'
      })
      .populate({
        path: 'store',
        select: 'name'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    
    // Calculate total and validate items
    let totalAmount = 0;
    const validatedItems = [];
    
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      if (!product.isActive) {
        return res.status(400).json({ message: `Product not available: ${product.name}` });
      }
      
      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      const itemPrice = product.price * item.quantity;
      totalAmount += itemPrice;
      
      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Get user's default store (for now, we'll use the first store they own)
    const userStore = await Store.findOne({ owner: req.user._id, isPublished: true });
    if (!userStore) {
      return res.status(400).json({ message: 'No published store found' });
    }
    
    const order = await Order.create({
      user: req.user._id,
      store: userStore._id,
      items: validatedItems,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: 'pending'
      },
      totalAmount
    });
    
    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'items.product',
        select: 'name price images'
      })
      .populate({
        path: 'store',
        select: 'name'
      });
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Seller)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'store',
        select: 'name'
      });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is admin or store owner
    const store = await Store.findById(order.store);
    if (req.user.role !== 'admin' && store.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    const updateData = {
      orderStatus: orderStatus || order.orderStatus
    };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    // If order is delivered, set estimated delivery date
    if (orderStatus === 'delivered') {
      updateData.estimatedDelivery = new Date();
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate({
      path: 'items.product',
      select: 'name price images'
    })
    .populate({
      path: 'store',
      select: 'name'
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get store orders (for seller dashboard)
// @route   GET /api/orders/store/:storeId
// @access  Private (Store owner)
router.get('/store/:storeId', protect, async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if user owns the store
    if (store.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }
    
    const orders = await Order.find({ store: req.params.storeId })
      .populate({
        path: 'items.product',
        select: 'name price images'
      })
      .populate({
        path: 'user',
        select: 'name email'
      })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;