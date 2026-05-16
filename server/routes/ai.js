const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect, authorize } = require('../middleware/auth');
const { HfInference } = require('@huggingface/inference');
const fs = require('fs');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// ── SaaS Monetization Middleware ─────────────────────────────────────────────
const requireCredits = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_tier, ai_credits, subscription_expires_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(500).json({ message: 'Error checking AI credits' });
    }

    // 1. Check expiration
    if (user.subscription_tier === 'pro' && user.subscription_expires_at) {
      const expireDate = new Date(user.subscription_expires_at);
      if (new Date() > expireDate) {
        // Expired! Demote to free instantly.
        await supabase.from('users').update({ subscription_tier: 'free', ai_credits: 0 }).eq('id', req.user.id);
        return res.status(403).json({ message: 'Your Eagle Choice Pro subscription has expired. Please renew to access AI tools.', expired: true });
      }
    } else if (user.subscription_tier !== 'pro') {
        return res.status(403).json({ message: 'AI Tools are locked. Please upgrade to Eagle Choice Pro.', locked: true });
    }

    // 2. Check credits
    if (user.ai_credits <= 0) {
      return res.status(403).json({ message: 'You have run out of AI credits for this month.', outOfCredits: true });
    }

    // Attach credits to request so routes can deduct them based on operation cost
    req.ai_credits = user.ai_credits;
    next();
  } catch (err) {
    console.error('[REQUIRE CREDITS ERROR]', err);
    res.status(500).json({ message: 'Server error checking credits' });
  }
};

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
// @route   POST /api/ai/v2/process-image
// @access  Private (Seller only)
// Note: This is now FREE for all sellers as requested
router.post('/v2/process-image', protect, authorize('seller'), async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'No image uploaded.' });
    }

    const { action } = req.body; 
    const imageFile = req.files.image;
    const imageData = fs.readFileSync(imageFile.tempFilePath);

    let modelId = 'Zhengyi/RMBG-1.4'; // Non-gated community mirror
    if (action === 'upscale') {
      modelId = 'stabilityai/stable-diffusion-x4-upscaler';
    }

    console.log(`[AI] Processing ${action} using model: ${modelId}...`);

    // ── GRADIO STEALTH TUNNEL ──────────────────────────────────────────
    // We connect to a public SPACE which is 100% free and has no 404 gates
    const { Client } = require('@gradio/client');
    const hfKey = String(process.env.HUGGINGFACE_API_KEY).trim();
    
    console.log(`[AI] Connecting to Gradio Space for ${action}...`);

    // We use a high-availability public Space mirror
    const app = await Client.connect("fffiloni/RMBG-1.4", { hf_token: hfKey });
    const result = await app.predict("/predict", {
		image: imageData,
    });

    // Gradio returns a URL or a file object. We fetch the data from it.
    const outputUrl = result.data[0].url;
    const axios = require('axios');
    const imageResponse = await axios.get(outputUrl, { responseType: 'arraybuffer' });

    console.log(`[AI] Success! Processed via Gradio Tunnel.`);
    
    res.set('Content-Type', 'image/png');
    res.send(Buffer.from(imageResponse.data));
  } catch (error) {
    console.error('[AI PROCESS ERROR]', error);
    res.status(500).json({ message: 'AI processing failed.', error: error.message });
  }
});

// @desc    Generate Unique AI Ad background
// @route   POST /api/ai/generate-ad
// @access  Private (Seller only)
router.post('/generate-ad', protect, authorize('seller'), requireCredits, async (req, res) => {
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

    // DEDUCT 1 CREDIT ON SUCCESS
    await supabase.from('users').update({ ai_credits: req.ai_credits - 1 }).eq('id', req.user.id);

    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('[AI AD GEN ERROR]', error);
    res.status(500).json({ message: 'Ad generation failed.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ASSISTANT LOGIC (Consolidated)
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_MAP = {
  routes: {
    '/seller/dashboard': {
      name: 'Dashboard',
      description: 'Your main business overview — revenue, orders, products, and store stats.',
      features: ['stats cards', 'recent orders', 'setup checklist', 'quick actions', 'store status'],
    },
    '/products/manage': {
      name: 'Product Management',
      description: 'Add, edit, and delete products. Includes AI background removal for product images.',
      features: ['add product', 'product list', 'delete product', 'image upload', 'AI background removal', 'category', 'stock', 'price'],
    },
    '/orders/tracking': {
      name: 'Orders',
      description: 'Track and manage all customer orders for your store.',
      features: ['order list', 'order status', 'customer info', 'order details'],
    },
    '/analytics': {
      name: 'Analytics',
      description: 'Revenue charts, order breakdowns, and top products — all from your real store data.',
      features: ['revenue chart', '30 day revenue', 'order status breakdown', 'top products', 'sales data'],
    },
    '/store-builder': {
      name: 'AI Store Builder',
      description: 'Customize your store\'s look and feel. Use AI to generate themes or adjust colors, fonts, and layout manually.',
      features: ['AI theme generation', 'color picker', 'font selection', 'live preview', 'desktop preview', 'mobile preview', 'publish store', 'save branding'],
    },
    '/card-generator': {
      name: 'Ad Card Generator',
      description: 'Generate branded advertising cards for your products using AI.',
      features: ['ad generation', 'product cards', 'brand visuals', 'marketing materials'],
    },
    '/seller/settings': {
      name: 'Settings',
      description: 'Manage your profile, store name, branding colors, font, and notification preferences.',
      features: ['store name', 'store description', 'primary color', 'background color', 'font family', 'notifications', 'account profile'],
    },
  },

  faqs: [
    {
      keywords: ['add product', 'new product', 'create product', 'list product', 'upload product'],
      response: {
        message: 'To add a new product to your store:',
        steps: [
          'Click **Products** in the left sidebar',
          'Click the **"Add New Product"** button (top right)',
          'Fill in: Product Name, Price, Stock Level, and Category',
          'Upload a product image — the AI will auto-remove the background',
          'Click **"Finalize and Publish"** to save',
        ],
        route: '/products/manage',
        tip: 'Pro tip: Use the AI background removal to make your products look professional instantly.',
      },
    },
    {
      keywords: ['publish store', 'go live', 'make store live', 'launch store', 'publish'],
      response: {
        message: 'To publish your store and make it visible to customers:',
        steps: [
          'Click **AI Store Builder** in the left sidebar',
          'Customize your store\'s colors and fonts if needed',
          'Click the green **"Publish to Live"** button',
          'Your store will immediately become public',
        ],
        route: '/store-builder',
        tip: 'Make sure you have at least one product before publishing.',
      },
    },
    {
      keywords: ['change color', 'change theme', 'store color', 'brand color', 'customize', 'theme', 'design'],
      response: {
        message: 'To customize your store\'s design:',
        steps: [
          'Click **AI Store Builder** in the left sidebar',
          'Use the **Accent Color** picker to set your brand color',
          'Use the **Background** picker to set the store background',
          'Choose a **Font Family** from the dropdown',
          'Watch the **live preview** update on the right',
          'Click **"Save Changes"** to save without publishing, or **"Publish to Live"** to go live immediately',
        ],
        route: '/store-builder',
        tip: 'Type a description like "dark luxury jewelry store" in the AI prompt and hit Generate for instant theme ideas.',
      },
    },
    {
      keywords: ['ai generate', 'generate theme', 'ai theme', 'generate store', 'ai design', 'ai prompt'],
      response: {
        message: 'To use AI to generate a store theme:',
        steps: [
          'Click **AI Store Builder** in the sidebar',
          'Find the **"AI Design Prompt"** text box',
          'Type a description of your store (e.g. "minimalist watch store with dark tones and gold accents")',
          'Click **"Generate with AI"**',
          'The AI will apply a matching theme to your live preview',
          'Adjust any colors you want, then click **"Save Changes"**',
        ],
        route: '/store-builder',
        tip: 'Try keywords like: dark, luxury, minimal, bold, organic, nature, tech, gaming.',
      },
    },
    {
      keywords: ['revenue', 'sales', 'how much', 'earnings', 'money', 'income'],
      response: {
        message: 'To see your revenue and earnings:',
        steps: [
          'Click **Analytics** in the left sidebar',
          'The **Total Revenue** card shows your all-time earnings',
          'The **Revenue (30 Days)** chart shows daily breakdown',
          'Scroll down to see your **Top Products** by sales',
        ],
        route: '/analytics',
        tip: 'Revenue only counts delivered and completed orders.',
      },
    },
    {
      keywords: ['orders', 'view orders', 'check orders', 'customer orders', 'order status'],
      response: {
        message: 'To view and manage your orders:',
        steps: [
          'Click **Orders** in the left sidebar',
          'You\'ll see a list of all customer orders',
          'Each row shows the order ID, customer name, date, amount, and status',
          'Order statuses: Pending → Processing → Shipped → Delivered',
        ],
        route: '/orders/tracking',
        tip: 'Your Dashboard also shows the 5 most recent orders for a quick glance.',
      },
    },
    {
      keywords: ['delete product', 'remove product'],
      response: {
        message: 'To delete a product:',
        steps: [
          'Click **Products** in the left sidebar',
          'Find the product in your catalog list',
          'Click the red **trash icon** on the right side of the product row',
          'Confirm the deletion in the popup',
        ],
        route: '/products/manage',
        tip: 'Deleted products cannot be recovered. Consider setting stock to 0 instead to hide them temporarily.',
      },
    },
    {
      keywords: ['change name', 'store name', 'rename store', 'update store'],
      response: {
        message: 'To change your store name:',
        steps: [
          'Click **Settings** in the left sidebar (under Account)',
          'Find the **Store Settings** section',
          'Edit the **Store Name** field',
          'Click **"Save Store Settings"**',
        ],
        route: '/seller/settings',
        tip: 'Your store URL slug is auto-generated from the name. Changing the name updates the slug.',
      },
    },
    {
      keywords: ['notification', 'email alert', 'new order alert'],
      response: {
        message: 'To manage your notification preferences:',
        steps: [
          'Click **Settings** in the left sidebar',
          'Scroll to the **Notifications** section',
          'Toggle each notification type on or off',
          'Changes are saved automatically',
        ],
        route: '/seller/settings',
      },
    },
    {
      keywords: ['ad', 'advertisement', 'marketing card', 'generate ad', 'product card'],
      response: {
        message: 'To generate marketing ads for your products:',
        steps: [
          'Click **Ad Generator** in the left sidebar (under AI Tools)',
          'Select a product or upload an image',
          'Customize the ad style and brand colors',
          'Download your generated ad card',
        ],
        route: '/card-generator',
        tip: 'Use high-quality product images (with background removed) for best results.',
      },
    },
    {
      keywords: ['logout', 'sign out', 'log out'],
      response: {
        message: 'To log out of your account:',
        steps: [
          'Scroll to the bottom of the left sidebar',
          'Click the red **"Logout"** button',
          'You will be returned to the homepage',
        ],
        route: null,
      },
    },
    {
      keywords: ['help', 'what can you do', 'what can i do', 'features', 'options'],
      response: {
        message: 'Here\'s everything you can do on Eagle Choice:',
        steps: [
          '📦 **Products** — Add, manage, and publish your product catalog',
          '🏪 **Store Builder** — Customize colors, fonts, and go live',
          '🤖 **AI Theme** — Describe your store, AI generates the design',
          '📊 **Analytics** — Revenue charts and order breakdowns',
          '🛍️ **Orders** — Track customer purchases',
          '🎴 **Ad Generator** — Create marketing cards for your products',
          '⚙️ **Settings** — Update store name, branding, notifications',
        ],
        route: null,
        tip: 'Ask me anything specific like "how do I add a product?" or "how do I publish my store?"',
      },
    },
    {
      keywords: ['stock', 'inventory', 'quantity', 'out of stock'],
      response: {
        message: 'To manage your product stock/inventory:',
        steps: [
          'Click **Products** in the sidebar',
          'When adding a product, fill in the **Stock Level** field',
          'Each product row in your catalog shows the current inventory count',
          'To update stock, you\'ll need to re-add or edit the product (edit coming soon)',
        ],
        route: '/products/manage',
        tip: 'Set stock to 0 to hide a product from customers without deleting it.',
      },
    },
  ],

  contextualGreetings: {
    '/seller/dashboard': 'You\'re on your Dashboard. I can help you understand your stats, navigate to products, or troubleshoot anything.',
    '/products/manage': 'You\'re in Product Management. Need help adding a product, uploading images, or removing something?',
    '/orders/tracking': 'You\'re viewing Orders. I can explain order statuses or help you find a specific order.',
    '/analytics': 'You\'re in Analytics. I can explain what each chart means or help you understand your revenue data.',
    '/store-builder': 'You\'re in the Store Builder. Need help with AI theme generation, colors, publishing your store?',
    '/card-generator': 'You\'re in the Ad Generator. Need help creating a marketing card for your products?',
    '/seller/settings': 'You\'re in Settings. I can help you update your store name, branding, or notification preferences.',
  },
};

const matchIntent = (message) => {
  const lower = message.toLowerCase().trim();
  let bestScore = 0;
  let bestMatch = null;

  for (const faq of SYSTEM_MAP.faqs) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (lower.includes(kw)) {
        score += kw.split(' ').length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestScore > 0 ? bestMatch : null;
};

// @desc    AI Assistant message processing
// @route   POST /api/ai/assistant
router.post('/assistant', protect, async (req, res) => {
  try {
    const { message, currentRoute } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const match = matchIntent(message);
    if (match) {
      return res.json({
        type: 'guided',
        ...match.response,
        contextNote: match.response.route && match.response.route === currentRoute
          ? "You're already on the right page!"
          : null,
      });
    }

    const pageContext = SYSTEM_MAP.contextualGreetings[currentRoute];
    const pageInfo = SYSTEM_MAP.routes[currentRoute];

    if (pageContext) {
      return res.json({
        type: 'contextual',
        message: `I'm not sure about that specific question, but here's what I can help with on this page:`,
        steps: pageInfo?.features?.map(f => `• ${f.charAt(0).toUpperCase() + f.slice(1)}`) || [],
        route: currentRoute,
        tip: 'Try asking: "how do I add a product?", "how do I publish my store?", or "show me my revenue"',
      });
    }

    return res.json({
      type: 'fallback',
      message: "I don't have a specific answer for that, but here's what I can help you with:",
      steps: [
        '📦 Adding and managing products',
        '🏪 Customizing and publishing your store',
        '🤖 Using AI to generate store themes',
        '📊 Understanding your analytics',
        '🛍️ Tracking customer orders',
        '⚙️ Updating settings and branding',
      ],
      route: null,
      tip: 'Try asking something like: "how do I add a product?" or "how do I publish my store?"',
    });
  } catch (error) {
    console.error('[AI ASSISTANT ERROR]', error);
    res.status(500).json({ message: 'Assistant temporarily unavailable' });
  }
});

// @desc    Get contextual greeting for assistant
// @route   GET /api/ai/assistant/greeting
router.get('/assistant/greeting', protect, (req, res) => {
  const { route } = req.query;
  const greeting = SYSTEM_MAP.contextualGreetings[route] || "Hi! I'm your Eagle Choice AI assistant. Ask me anything about your store.";
  res.json({ greeting, availablePages: Object.keys(SYSTEM_MAP.routes) });
});

module.exports = router;