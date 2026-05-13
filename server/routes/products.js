const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Store = require('../models/Store');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { storeId, category, featured, limit } = req.query;
    
    let query = { isActive: true };
    
    if (storeId) query.store = storeId;
    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    
    let products = Product.find(query)
      .populate('store', 'name')
      .sort({ createdAt: -1 });
    
    if (limit) {
      products = products.limit(parseInt(limit));
    }
    
    products = await products;
    
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('store', 'name description')
      .populate({
        path: 'store',
        populate: {
          path: 'owner',
          select: 'name email'
        }
      });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.isActive || !product.store.isPublished || !product.store.isVerified) {
      return res.status(403).json({ message: 'Product not available' });
    }
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Seller only)
router.post('/', protect, authorize('seller'), async (req, res) => {
  try {
    const { name, description, price, comparePrice, stock, sku, category, tags, images } = req.body;
    
    // Get user's store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(400).json({ message: 'You need to create a store first' });
    }
    
    if (!store.isPublished) {
      return res.status(400).json({ message: 'You need to publish your store first' });
    }
    
    // Check if SKU already exists (if provided)
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }
    
    const product = await Product.create({
      name,
      description,
      price,
      comparePrice: comparePrice || null,
      stock: stock || 0,
      sku: sku || null,
      category: category || null,
      tags: tags || [],
      images: images || [],
      store: store._id
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Store owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get user's store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(400).json({ message: 'Store not found' });
    }
    
    // Check if user owns the product's store
    if (product.store.toString() !== store._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    const { name, description, price, comparePrice, stock, sku, category, tags, images, isActive, isFeatured } = req.body;
    
    // Check if SKU already exists (if provided and changed)
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }
    
    product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || product.name,
        description: description || product.description,
        price: price !== undefined ? price : product.price,
        comparePrice: comparePrice !== undefined ? comparePrice : product.comparePrice,
        stock: stock !== undefined ? stock : product.stock,
        sku: sku !== undefined ? sku : product.sku,
        category: category !== undefined ? category : product.category,
        tags: tags !== undefined ? tags : product.tags,
        images: images !== undefined ? images : product.images,
        isActive: isActive !== undefined ? isActive : product.isActive,
        isFeatured: isFeatured !== undefined ? isFeatured : product.isFeatured
      },
      { new: true, runValidators: true }
    );
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Store owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get user's store
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(400).json({ message: 'Store not found' });
    }
    
    // Check if user owns the product's store
    if (product.store.toString() !== store._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await product.remove();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get products by store
// @route   GET /api/stores/:storeId/products
// @access  Public
router.get('/stores/:storeId/products', async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    if (!store.isPublished || !store.isVerified) {
      return res.status(403).json({ message: 'Store not available' });
    }
    
    const products = await Product.find({ 
      store: store._id,
      isActive: true
    }).sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;