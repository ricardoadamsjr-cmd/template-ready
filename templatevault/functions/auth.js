// auth.js
//- auth.js contains your createCheckoutSession function (Stripe Checkout session creation).
//webhook.js contains your stripeWebhook function (Stripe webhook listener).
//index.js simply re‑exports them so Firebase can discover and deploy both functions.
//You don’t need to initialize Stripe or Firebase Admin in index.js anymore — that logic lives inside auth.js and webhook.js.

import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import Stripe from "stripe";

const stripeSecretKey = defineString("STRIPE_SECRET_KEY");
const stripe = new Stripe(stripeSecretKey.value());



export const createCheckoutSession = onRequest(async (req, res) => {
  try {
    const { email, uid } = req.body;
    if (!email || !uid) {
      return res.status(400).send("Missing required parameters: email or uid");
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      metadata: { firebaseUID: uid },
      mode: "subscription",
      line_items: [
        {
          price: "price_1Sb8n4EB56lmrQFkxL0aairz", // replace with your real Stripe Price ID
          quantity: 1,
        },
      ],
      success_url: "https://yourapp.web.app/success",
      cancel_url: "https://yourapp.web.app/cancel",
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).send(err.toString());
  }
});
