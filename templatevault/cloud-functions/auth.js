// auth.js

// 1. IMPORTS
// Note: We need Stripe and functions to access config and create sessions
const Stripe = require('stripe');
const functions = require('firebase-functions'); 
const admin = require("firebase-admin"); // Keep if you use it for something else in auth.js, but not strictly needed for this file's logic

// 2. INITIALIZATION
// Initialize Stripe using the configuration set via the Firebase CLI
const stripe = new Stripe(functions.config().stripe.secret_key);


/**
 * Express Route Handler for creating a Stripe Checkout Session.
 * * This function is designed to be mounted using:
 * api.post('/createcheckoutsession', require('./auth'));
 * * It assumes CORS and body parsing are handled by middleware in index.js.
 */
const createCheckoutSessionHandler = async (req, res) => {
  try {
    // 1. Only allow POST requests (Optional, but good practice)
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Data extraction (The Express app.use(express.json()) handles req.body)
    const { email, uid } = req.body;
    
    // 3. Validation
    if (!email || !uid) {
      return res.status(400).json({ 
        error: "Missing required parameters: email or uid" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: "Invalid email format" 
      });
    }

    console.log(`Creating checkout session for user: ${uid}, email: ${email}`);

    // 4. Stripe Session Creation
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      metadata: { 
        firebaseUID: uid,
        email: email 
      },
      mode: "subscription",
      line_items: [
        {
          // Use Firebase Config for Price ID
          price: functions.config().stripe.price_id || "price_1Sb8n4EB56lmrQFkxL0aairz",
          quantity: 1,
        },
      ],
      // Use Firebase Config for Frontend URL
      success_url: `${functions.config().frontend.url}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${functions.config().frontend.url}/dashboard?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log(`Checkout session created successfully: ${session.id}`);
    res.json({ 
      id: session.id,
      url: session.url 
    });

  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ 
      error: "Failed to create checkout session",
      details: err.message
    });
  }
};

// Export the Express handler function
module.exports = createCheckoutSessionHandler;