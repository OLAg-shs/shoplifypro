const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const { protect } = require('../middleware/auth');
const axios = require('axios');
const crypto = require('crypto');

// The Paystack Secret Key should be in your environment variables.
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// @desc    Initialize a Paystack checkout transaction
// @route   POST /api/billing/create-checkout
// @access  Private
router.post('/create-checkout', protect, async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ message: 'Server configuration error: Paystack key missing' });
    }

    // We fetch the user's email from the database to send to Paystack
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', req.user.id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare the payload for Paystack
    // We pass the user ID in the metadata so the webhook knows exactly who paid!
    const payload = {
      email: user.email,
      amount: 1000 * 100, // Paystack uses kobo/cents. So $10.00 (or 10.00 GHS/NGN) = 1000 * 100
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/seller/billing?payment=success`,
      metadata: {
        user_id: req.user.id,
        custom_fields: [
          {
            display_name: "Subscription",
            variable_name: "subscription_type",
            value: "Eagle Choice Pro - AI Studio Access"
          }
        ]
      }
    };

    // Call Paystack API
    const response = await axios.post('https://api.paystack.co/transaction/initialize', payload, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data.status) {
      res.json({
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference
      });
    } else {
      res.status(400).json({ message: 'Failed to initialize payment', details: response.data.message });
    }
  } catch (error) {
    console.error('[PAYSTACK CHECKOUT ERROR]', error.response?.data || error.message);
    res.status(500).json({ message: 'Server error creating checkout session' });
  }
});

// @desc    Paystack Webhook endpoint (Automated Token Refill)
// @route   POST /api/billing/webhook
// @access  Public (Must be public so Paystack can reach it, but protected via HMAC signature)
router.post('/webhook', express.json({type: 'application/json'}), async (req, res) => {
  try {
    // 1. Verify the webhook signature from Paystack
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).send('Unauthorized webhook signature');
    }

    // 2. Acknowledge the webhook immediately so Paystack doesn't timeout
    res.sendStatus(200);

    const event = req.body;

    // 3. Process a successful charge
    if (event.event === 'charge.success') {
      const data = event.data;
      const userId = data.metadata?.user_id;

      if (!userId) {
        console.error('[WEBHOOK ERROR] No user_id found in Paystack metadata!');
        return;
      }

      console.log(`[WEBHOOK] Payment successful for User ID: ${userId}. Refilling AI credits...`);

      // 4. Update the user in Supabase: 
      // Set to PRO, give 100 credits, and extend expiration by 30 days
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          subscription_tier: 'pro',
          ai_credits: 100, // e.g. 100 generation credits per month
          subscription_expires_at: expireDate.toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[WEBHOOK DB ERROR] Failed to update user credits:', updateError);
      } else {
        console.log(`[WEBHOOK SUCCESS] User ${userId} upgraded to Pro until ${expireDate.toISOString()}`);
      }
    }
  } catch (error) {
    console.error('[WEBHOOK PROCESSING ERROR]', error);
    // Note: We already sent 200, so we just log the internal error
  }
});

module.exports = router;
