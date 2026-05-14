const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect } = require('../middleware/auth');

// @desc    Get current user's orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, images))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(orders);
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get store's orders
// @route   GET /api/orders/store
// @access  Private (Seller only)
router.get('/store', protect, async (req, res) => {
  try {
    // Get user's store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (storeError || !store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, images)), users(name, email)')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(orders);
  } catch (error) {
    console.error("GET STORE ORDERS ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), stores(name, owner_id)')
      .eq('id', req.params.id)
      .single();
    
    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is buyer or store owner
    if (order.user_id !== req.user.id && order.stores.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { store_id, order_items, shipping_address, payment_info, total_amount } = req.body;
    
    if (!order_items || order_items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: req.user.id,
          store_id,
          shipping_address,
          payment_info,
          total_amount,
          order_status: 'pending'
        }
      ])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Insert order items
    const itemsToInsert = order_items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);
    
    if (itemsError) throw itemsError;
    
    res.status(201).json(order);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create new orders from checkout cart (handles multi-store)
// @route   POST /api/orders/checkout
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  try {
    const { items, total_amount, shipping_address, payment_reference } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    if (!payment_reference) {
      return res.status(400).json({ message: 'Missing payment reference' });
    }

    // 1. Verify Payment with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.warn('PAYSTACK_SECRET_KEY not set! Skipping strict verification for development purposes.');
    } else {
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${payment_reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecret}`
        }
      });
      
      const paystackData = await paystackRes.json();
      
      if (!paystackData.status || paystackData.data.status !== 'success') {
        return res.status(400).json({ message: 'Payment verification failed' });
      }

      // Check if amount matches (Paystack amount is in kobo/cents)
      const expectedAmount = Math.round(total_amount * 100);
      if (paystackData.data.amount < expectedAmount) {
        return res.status(400).json({ message: 'Payment amount mismatch' });
      }
    }

    // 2. Group items by store_id
    const storeGroups = {};
    items.forEach(item => {
      const storeId = item.store_id || item.stores?.id; // Depends on how product was fetched
      if (!storeId) {
        console.warn('Product missing store_id', item);
        return;
      }
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = {
          items: [],
          total: 0
        };
      }
      storeGroups[storeId].items.push(item);
      storeGroups[storeId].total += (parseFloat(item.price) * item.quantity);
    });

    const createdOrders = [];

    // Create an order for each store
    for (const storeId of Object.keys(storeGroups)) {
      const group = storeGroups[storeId];
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: req.user.id,
            store_id: storeId,
            shipping_address,
            payment_info: { reference: payment_reference, provider: 'paystack' },
            total_amount: group.total,
            order_status: 'processing' // Paid via Paystack
          }
        ])
        .select()
        .single();
      
      if (orderError) throw orderError;

      const itemsToInsert = group.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);
        
      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of group.items) {
        // Decrement stock (ignoring errors for MVP speed)
        await supabase.rpc('decrement_stock', { p_id: item.id, qty: item.quantity });
      }

      createdOrders.push(order);
    }

    res.status(201).json({ message: 'Checkout successful', orders: createdOrders });
  } catch (error) {
    console.error("[CHECKOUT ERROR]", error);
    res.status(500).json({ message: 'Server error during checkout' });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Store Owner only)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { order_status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    // Get order and store owner
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, stores(owner_id)')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the store owner (or admin) can update the status
    if (order.stores.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ order_status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("[UPDATE ORDER STATUS ERROR]", error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;