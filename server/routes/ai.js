const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');
const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// @desc    Generate a store theme using AI-like logic based on a prompt
// @route   POST /api/ai/generate-theme
// @access  Private (Seller only)
router.post('/generate-theme', protect, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ message: 'A store description prompt is required.' });
    }

    const lower = prompt.toLowerCase();

    // Keyword-based theme generation logic
    const isDark    = lower.includes('dark') || lower.includes('gaming') || lower.includes('night') || lower.includes('tech');
    const isLuxury  = lower.includes('luxury') || lower.includes('elegant') || lower.includes('premium') || lower.includes('gold');
    const isNature  = lower.includes('organic') || lower.includes('nature') || lower.includes('eco') || lower.includes('green');
    const isBold    = lower.includes('bold') || lower.includes('sport') || lower.includes('energy') || lower.includes('fitness');
    const isMinimal = lower.includes('minimal') || lower.includes('clean') || lower.includes('simple') || lower.includes('white');

    let theme = {
      name:            prompt.split(' ').slice(0, 3).join(' ') + ' Store',
      primaryColor:    '#6366f1',
      secondaryColor:  '#ec4899',
      backgroundColor: '#ffffff',
      textColor:       '#1f2937',
      fontFamily:      'Inter, sans-serif',
      layoutStyle:     'modern',
      generatedBy:     'eagle-ai',
    };

    if (isDark) {
      theme = { ...theme, primaryColor: '#8b5cf6', secondaryColor: '#06b6d4', backgroundColor: '#0f172a', textColor: '#f8fafc', fontFamily: 'Inter, sans-serif', layoutStyle: 'grid' };
    } else if (isLuxury) {
      theme = { ...theme, primaryColor: '#d4af37', secondaryColor: '#92400e', backgroundColor: '#fafaf9', textColor: '#1c1917', fontFamily: "'Playfair Display', serif", layoutStyle: 'editorial' };
    } else if (isNature) {
      theme = { ...theme, primaryColor: '#16a34a', secondaryColor: '#a3e635', backgroundColor: '#f0fdf4', textColor: '#14532d', fontFamily: "'DM Sans', sans-serif", layoutStyle: 'minimal' };
    } else if (isBold) {
      theme = { ...theme, primaryColor: '#dc2626', secondaryColor: '#ea580c', backgroundColor: '#ffffff', textColor: '#111827', fontFamily: "'Outfit', sans-serif", layoutStyle: 'grid' };
    } else if (isMinimal) {
      theme = { ...theme, primaryColor: '#374151', secondaryColor: '#6b7280', backgroundColor: '#ffffff', textColor: '#111827', fontFamily: "'Inter', sans-serif", layoutStyle: 'minimal' };
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    res.json({
      success: true,
      theme,
      prompt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating theme' });
  }
});

// @desc    Get AI-powered store recommendations based on buyer preferences
// @route   GET /api/ai/recommendations/stores
// @access  Private (Buyer only)
router.get('/recommendations/stores', protect, authorize('buyer'), async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    let dbQuery = supabase
      .from('stores')
      .select('*, users(name, email)')
      .eq('is_published', true)
      .eq('is_verified', true)
      .limit(parseInt(limit));

    if (query && query.trim() !== '') {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: stores, error } = await dbQuery;

    if (error) throw error;

    const recommendedStores = (stores || []).map(store => {
      let relevanceScore = 0.5;
      const reasons = [];

      if (query) {
        const q = query.toLowerCase();
        if (store.name?.toLowerCase().includes(q)) { relevanceScore += 0.3; reasons.push('Name matches your search'); }
        if (store.description?.toLowerCase().includes(q)) { relevanceScore += 0.2; reasons.push('Description matches your search'); }
      }
      if (store.is_verified) { relevanceScore += 0.1; reasons.push('Verified seller'); }

      return {
        ...store,
        relevanceScore: Math.min(relevanceScore, 1.0),
        reasons: reasons.length > 0 ? reasons : ['Popular store'],
        matchPercentage: Math.round(Math.min(relevanceScore, 1.0) * 100),
      };
    });

    recommendedStores.sort((a, b) => b.relevanceScore - a.relevanceScore);
    res.json(recommendedStores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get AI-powered product recommendations based on buyer preferences
// @route   GET /api/ai/recommendations/products
// @access  Private (Buyer only)
router.get('/recommendations/products', protect, authorize('buyer'), async (req, res) => {
  try {
    const { query, storeId, category, limit = 20 } = req.query;

    let dbQuery = supabase
      .from('products')
      .select('*, stores(name)')
      .eq('is_active', true)
      .limit(parseInt(limit));

    if (storeId)  dbQuery = dbQuery.eq('store_id', storeId);
    if (category) dbQuery = dbQuery.eq('category', category);
    if (query && query.trim() !== '') {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: products, error } = await dbQuery;

    if (error) throw error;

    const recommendedProducts = (products || []).map(product => {
      let relevanceScore = 0.5;
      const reasons = [];

      if (query) {
        const q = query.toLowerCase();
        if (product.name?.toLowerCase().includes(q)) { relevanceScore += 0.3; reasons.push('Name matches your search'); }
        if (product.description?.toLowerCase().includes(q)) { relevanceScore += 0.2; reasons.push('Description matches your search'); }
      }
      if (product.is_featured) { relevanceScore += 0.2; reasons.push('Featured product'); }

      return {
        ...product,
        relevanceScore: Math.min(relevanceScore, 1.0),
        reasons: reasons.length > 0 ? reasons : ['Recommended for you'],
        matchPercentage: Math.round(Math.min(relevanceScore, 1.0) * 100),
      };
    });

    recommendedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    res.json(recommendedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get trending stores/products
// @route   GET /api/ai/trending
// @access  Private
router.get('/trending', protect, async (req, res) => {
  try {
    const [{ data: trendingStores }, { data: trendingProducts }] = await Promise.all([
      supabase.from('stores').select('*').eq('is_published', true).eq('is_verified', true).order('total_orders', { ascending: false }).limit(5),
      supabase.from('products').select('*, stores(name)').eq('is_active', true).eq('is_featured', true).limit(10),
    ]);

    res.json({
      stores:   trendingStores   || [],
      products: trendingProducts || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Process image (Background Removal or Upscaling)
// @route   POST /api/ai/process-image
// @access  Private (Seller only)
router.post('/process-image', protect, authorize('seller'), async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    const { action } = req.body; // 'remove-bg' or 'upscale'
    const imageFile = req.files.image;
    const imageData = fs.readFileSync(imageFile.tempFilePath);

    let result;
    if (action === 'remove-bg') {
      console.log('[AI] Removing background...');
      result = await hf.imageToImage({
        model: 'briaai/RMBG-1.4',
        inputs: new Blob([imageData]),
      });
    } else if (action === 'upscale') {
      console.log('[AI] Upscaling image...');
      result = await hf.imageToImage({
        model: 'stabilityai/stable-diffusion-x4-upscaler',
        inputs: new Blob([imageData]),
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "remove-bg" or "upscale".' });
    }

    // Convert Blob back to Buffer for response
    const arrayBuffer = await result.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('[AI PROCESS ERROR]', error);
    res.status(500).json({ message: 'AI processing failed.', error: error.message });
  }
});

// @desc    Generate Unique AI Ad background
// @route   POST /api/ai/generate-ad
// @access  Private (Seller only)
router.post('/generate-ad', protect, authorize('seller'), async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required for ad generation.' });
    }

    console.log('[AI] Generating ad background for prompt:', prompt);
    const result = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-3-medium',
      inputs: prompt,
    });

    const arrayBuffer = await result.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('[AI AD GEN ERROR]', error);
    res.status(500).json({ message: 'Ad generation failed.', error: error.message });
  }
});

module.exports = router;