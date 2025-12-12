// auth.js
// Contains your createCheckoutSession function (Stripe Checkout session creation).
// webhook.js contains your stripeWebhook function (Stripe webhook listener).
// index.js simply re‑exports them so Firebase can discover and deploy both functions.

import Stripe from "stripe";
import admin from "firebase-admin";

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { email, uid } = req.body;
    
    if (!email || !uid) {
      return res.status(400).json({ 
        error: "Missing required parameters: email or uid" 
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      metadata: { firebaseUID: uid },
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || "price_1Sb8n4EB56lmrQFkxL0aairz", // Use env var or fallback
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'https://yourapp.web.app'}/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://yourapp.web.app'}/cancel`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ 
      error: "Failed to create checkout session",
      details: err.message 
    });
  }
};
