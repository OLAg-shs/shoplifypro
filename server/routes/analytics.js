const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get seller analytics summary
// @route   GET /api/analytics/seller
// @access  Private (Seller only)
router.get('/seller', protect, authorize('seller'), async (req, res) => {
  try {
    // Get seller's store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (storeError || !store) {
      return res.json({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        revenueByDay: [],
        ordersByStatus: {},
        topProducts: [],
      });
    }

    // Run parallel queries
    const [
      { data: orders },
      { data: products },
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total_amount, order_status, created_at, order_items(quantity, price, product_id, products(name))')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('products')
        .select('id, name, stock, is_active')
        .eq('store_id', store.id),
    ]);

    const safeOrders = orders || [];
    const safeProducts = products || [];

    // Total revenue
    const totalRevenue = safeOrders.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);

    // Revenue by day (last 30 days)
    const today = new Date();
    const last30 = new Date(today);
    last30.setDate(today.getDate() - 29);

    const revenueMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(last30);
      d.setDate(last30.getDate() + i);
      revenueMap[d.toISOString().split('T')[0]] = 0;
    }

    safeOrders.forEach(o => {
      const day = new Date(o.created_at).toISOString().split('T')[0];
      if (revenueMap[day] !== undefined) {
        revenueMap[day] += parseFloat(o.total_amount || 0);
      }
    });

    const revenueByDay = Object.entries(revenueMap).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));

    // Orders by status
    const ordersByStatus = safeOrders.reduce((acc, o) => {
      acc[o.order_status] = (acc[o.order_status] || 0) + 1;
      return acc;
    }, {});

    // Top products by order frequency
    const productFreq = {};
    safeOrders.forEach(o => {
      (o.order_items || []).forEach(item => {
        const key = item.product_id;
        const name = item.products?.name || 'Unknown';
        if (!productFreq[key]) productFreq[key] = { name, quantity: 0, revenue: 0 };
        productFreq[key].quantity += item.quantity || 0;
        productFreq[key].revenue += parseFloat(item.price || 0) * (item.quantity || 1);
      });
    });

    const topProducts = Object.values(productFreq)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: safeOrders.length,
      totalProducts: safeProducts.length,
      activeProducts: safeProducts.filter(p => p.is_active).length,
      revenueByDay,
      ordersByStatus,
      topProducts,
    });
  } catch (error) {
    console.error('[ANALYTICS ERROR]', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

module.exports = router;
