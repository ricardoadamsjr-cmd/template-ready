// auth.js
// Contains your createCheckoutSession function (Stripe Checkout session creation).
// webhook.js contains your stripeWebhook function (Stripe webhook listener).
// index.js simply re‑exports them so Firebase can discover and deploy both functions.

const Stripe = require("stripe");
const admin = require("firebase-admin");
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = (req, res) => {
  return cors(req, res, async () => {
    try {
      // Only allow POST requests
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { email, uid } = req.body;
      
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

      const session = await stripe.checkout.sessions.create({
        customer_email: email,
        metadata: { 
          firebaseUID: uid,
          email: email 
        },
        mode: "subscription",
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID || "price_1Sb8n4EB56lmrQFkxL0aairz",
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'https://yourapp.web.app'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://yourapp.web.app'}/dashboard?canceled=true`,
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
        details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    }
  });
};
