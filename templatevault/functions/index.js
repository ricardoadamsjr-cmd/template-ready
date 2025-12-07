// -------------------- IMPORTS --------------------
const { onRequest } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const stripeLib = require("stripe");

// -------------------- FIREBASE INIT --------------------
admin.initializeApp();

// -------------------- PARAMETERIZED CONFIG --------------------
// Define parameters for Stripe secrets (set in Firebase environment config)
const stripeSecretKey = defineString("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineString("STRIPE_WEBHOOK_SECRET");

// Initialize Stripe with secret key
const stripe = stripeLib(stripeSecretKey.value());

// -------------------- CREATE CHECKOUT SESSION --------------------
exports.createCheckoutSession = onRequest(async (req, res) => {
  try {
    if (!req.body.email || !req.body.uid) {
      return res.status(400).send("Missing required parameters: email or uid");
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: req.body.email,
      metadata: { firebaseUID: req.body.uid },
      mode: "subscription",
      line_items: [
        {
          price: "price_1234567890", // TODO: replace with your real Stripe Price ID
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

// -------------------- STRIPE WEBHOOK LISTENER --------------------
exports.stripeWebhook = onRequest(
  { rawBody: true }, // IMPORTANT: rawBody must be enabled for signature verification
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

    // Handle subscription updates
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      const firebaseUID = subscription.metadata.firebaseUID;

      if (firebaseUID) {
        try {
          await admin
            .firestore()
            .collection("users")
            .doc(firebaseUID)
            .update({
              subscriptionStatus: subscription.status,
              currentPeriodEnd: subscription.current_period_end,
            });

          console.log(
            `Updated subscription for user ${firebaseUID}: ${subscription.status}`
          );
        } catch (err) {
          console.error("Error updating Firestore:", err);
        }
      } else {
        console.warn("No firebaseUID found in subscription metadata");
      }
    }

    res.sendStatus(200);
  }
);