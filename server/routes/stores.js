const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
router.get('/', async (req, res) => {
  try {
    let { data: stores, error } = await supabase
      .from('stores')
      .select(`
        *,
        owner:users(id, name, email)
      `)
      .eq('is_published', true)
      .eq('is_verified', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    let { data: store, error } = await supabase
      .from('stores')
      .select(`
        *,
        owner:users(id, name, email),
        products:products(id, name, price, images)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (!store.is_published || !store.is_verified) {
      return res.status(403).json({ message: 'Store not available' });
    }

    // Filter products to only active ones
    store.products = store.products.filter(product => product.is_active);

    res.json(store);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Create store
// @route   POST /api/stores
// @access  Private (Seller only)
router.post('/', protect, authorize('seller'), async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if user already has a store
    let { data: existingStore, error: fetchError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', req.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingStore) {
      return res.status(400).json({ message: 'You already have a store' });
    }

    const { data: newStore, error: insertError } = await supabase
      .from('stores')
      .insert([
        {
          name,
          description,
          owner_id: req.user.id,
          is_published: false,
          is_verified: false,
          branding: {
            theme: {
              primaryColor: '#3B82F6',
              secondaryColor: '#1D4ED8',
              accentColor: '#06B6D4',
              backgroundColor: '#FFFFFF',
              textColor: '#1F2937',
              fontFamily: 'system-ui, sans-serif'
            },
            assets: {
              logo: { url: '', alt: '', processed: { white_background: false } },
              banner: { url: '', alt: '', processed: { white_background: false } },
              customImages: []
            },
            layout: {
              showFeaturedProducts: true,
              productsPerRow: 3,
              sections: ['hero', 'featured', 'categories', 'new-arrivals']
            },
            customContent: {
              heroSection: '',
              footerText: '',
              policies: {
                refund: '',
                shipping: '',
                privacy: ''
              }
            }
          },
          settings: {
            paymentMethods: ['credit_card', 'paypal'],
            shipping: {
              countriesServed: ['US'],
              freeShippingThreshold: 50,
              handlingTime: 3
            },
            tax: {
              chargesTax: false,
              taxRate: 0
            }
          },
          stats: {
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            lastOrderDate: null
          }
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    res.status(201).json(newStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private (Store owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    let { data: store, error: fetchError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user owns the store
    if (store.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this store' });
    }

    const { name, description, branding, settings } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (branding !== undefined) updateData.branding = branding;
    if (settings !== undefined) updateData.settings = settings;

    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json(updatedStore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Publish store
// @route   PUT /api/stores/:id/publish
// @access  Private (Store owner only)
router.put('/:id/publish', protect, async (req, res) => {
  try {
    let { data: store, error: fetchError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user owns the store
    if (store.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to publish this store' });
    }

    const { data: updatedStore, error: updateError } = await supabase
      .from('stores')
      .update({ is_published: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({ message: 'Store published successfully', store: updatedStore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;