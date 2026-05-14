const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM KNOWLEDGE MAP
// This is the ground-truth map of EVERY real feature, page, and route that
// exists in Eagle Choice. The AI assistant ONLY references things in this map.
// Adding a feature here means the AI can guide users to it.
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

// ─────────────────────────────────────────────────────────────────────────────
// INTENT MATCHING ENGINE
// Scores each FAQ against the user's message using keyword frequency.
// Returns the best match above a minimum threshold.
// ─────────────────────────────────────────────────────────────────────────────
const matchIntent = (message) => {
  const lower = message.toLowerCase().trim();
  let bestScore = 0;
  let bestMatch = null;

  for (const faq of SYSTEM_MAP.faqs) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (lower.includes(kw)) {
        // Longer keyword matches = higher score (more specific)
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

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/assistant
// Body: { message: string, currentRoute: string }
// Returns: { message, steps, route, tip, type }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/assistant', protect, async (req, res) => {
  try {
    const { message, currentRoute } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (message.trim().length > 500) {
      return res.status(400).json({ message: 'Message too long (max 500 characters)' });
    }

    // Try to match a known intent
    const match = matchIntent(message);

    if (match) {
      return res.json({
        type: 'guided',
        ...match.response,
        // If the FAQ route matches current route, add a contextual note
        contextNote: match.response.route && match.response.route === currentRoute
          ? "You're already on the right page!"
          : null,
      });
    }

    // Fallback: contextual hint based on current page
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

    // Generic fallback
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ai/assistant/greeting
// Returns a contextual greeting based on the current page
// ─────────────────────────────────────────────────────────────────────────────
router.get('/assistant/greeting', protect, (req, res) => {
  const { route } = req.query;
  const greeting = SYSTEM_MAP.contextualGreetings[route] || "Hi! I'm your Eagle Choice AI assistant. Ask me anything about your store.";
  res.json({ greeting, availablePages: Object.keys(SYSTEM_MAP.routes) });
});

module.exports = { router, SYSTEM_MAP };
