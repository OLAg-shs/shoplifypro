const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { storeId, category, featured, limit } = req.query;
    
    let query = supabase
      .from('products')
      .select('*, stores(name)')
      .eq('is_active', true);
    
    if (storeId) query = query.eq('store_id', storeId);
    if (category) query = query.eq('category', category);
    if (featured) query = query.eq('is_featured', featured === 'true');
    
    query = query.order('created_at', { ascending: false });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data: products, error } = await query;
    
    if (error) throw error;
    
    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get seller's own products (scoped to their store)
// @route   GET /api/products/mine
// @access  Private (Seller only)
router.get('/mine', protect, authorize('seller'), async (req, res) => {
  try {
    // Get seller's store first
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (!store) {
      return res.json([]); // No store yet — return empty, not an error
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(products || []);
  } catch (error) {
    console.error('[GET /products/mine ERROR]', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*, stores(*, users(name, email))')
      .eq('id', req.params.id)
      .single();
    
    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.is_active || !product.stores.is_published || !product.stores.is_verified) {
      return res.status(403).json({ message: 'Product not available' });
    }
    
    res.json(product);
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Seller only)
router.post('/', protect, authorize('seller'), async (req, res) => {
  try {
    const { name, description, price, compare_price, stock, sku, category, tags, images } = req.body;
    
    // Get user's store (store does NOT need to be published to add products)
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (storeError || !store) {
      return res.status(400).json({ message: 'You need to create a store first before adding products.' });
    }
    
    // Check if SKU already exists
    if (sku) {
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .single();

      if (existingProduct) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }
    
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price,
          compare_price: compare_price || null,
          stock: stock || 0,
          sku: sku || null,
          category: category || null,
          tags: tags || [],
          images: images || [],
          store_id: store.id
        }
      ])
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Store owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if product exists and if user owns it
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*, stores(owner_id)')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stores.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    const { name, description, price, compare_price, stock, sku, category, tags, images, is_active, is_featured } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (compare_price !== undefined) updateData.compare_price = compare_price;
    if (stock !== undefined) updateData.stock = stock;
    if (sku !== undefined) updateData.sku = sku;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (images !== undefined) updateData.images = images;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Store owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check ownership
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*, stores(owner_id)')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.stores.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);
    
    if (deleteError) throw deleteError;
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;