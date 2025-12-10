// webhook.js
// Handles Stripe webhook events. Pure ESM.
import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import admin from "firebase-admin";
import Stripe from "stripe";

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

const stripeSecretKey = defineString("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineString("STRIPE_WEBHOOK_SECRET");

const stripe = new Stripe(stripeSecretKey.value());

export const stripeWebhook = onRequest(
  { rawBody: true },
  async (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        stripeWebhookSecret.value()
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      const firebaseUID = subscription.metadata.firebaseUID;

      if (firebaseUID) {
        await admin.firestore().collection("users").doc(firebaseUID).update({
          subscriptionStatus: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        });
        console.log(
          `Updated subscription for user ${firebaseUID}: ${subscription.status}`
        );
      }
    }
    res.sendStatus(200);
  }
);
