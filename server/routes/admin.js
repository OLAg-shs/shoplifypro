const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');

// Apply protect and authorize to all routes in this file
router.use(protect);
router.use(authorize('admin'));

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // We would use aggregated queries ideally, but for MVP we count rows
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: sellersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller');
    const { count: storesCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });

    const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('order_status', 'delivered');
    const totalRevenue = revenueData ? revenueData.reduce((acc, curr) => acc + parseFloat(curr.total_amount || 0), 0) : 0;

    res.json({
      totalUsers: usersCount || 0,
      totalSellers: sellersCount || 0,
      totalStores: storesCount || 0,
      totalOrders: ordersCount || 0,
      totalRevenue
    });
  } catch (error) {
    console.error("[ADMIN STATS ERROR]", error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// @desc    Get recent platform activity (latest stores and users)
// @route   GET /api/admin/activity
// @access  Private (Admin only)
router.get('/activity', async (req, res) => {
  try {
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentStores } = await supabase
      .from('stores')
      .select('id, name, created_at, users(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({ recentUsers, recentStores });
  } catch (error) {
    console.error("[ADMIN ACTIVITY ERROR]", error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

module.exports = router;
