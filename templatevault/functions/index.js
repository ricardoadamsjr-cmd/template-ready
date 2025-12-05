///////////THIS CALLS YOUR BACKEND TO CREATE A STRIPE CHECKOUT SESSION///////////

// These const variables are required for the function to work:
// - functions: needed to create the cloud function
// - admin: needed to access Firestore
// - stripe: needed to create the checkout session
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);

admin.initializeApp();

// Create Checkout Session
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: req.body.email,
      metadata: { firebaseUID: req.body.uid },
      mode: "subscription",
      line_items: [{ price: "price_123", quantity: 1 }], // replace with your real price ID
      success_url: "https://yourapp.web.app/success",
      cancel_url: "https://yourapp.web.app/cancel",
    });
    res.json({ id: session.id });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// Webhook Listener
const endpointSecret = functions.config().stripe.webhook_secret;

exports.stripeWebhook = functions.https.onRequest((req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"],
      endpointSecret
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const firebaseUID = subscription.metadata.firebaseUID;

    admin.firestore()
      .collection("users")
      .doc(firebaseUID)
      .update({
        subscriptionStatus: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      });
  }

  res.sendStatus(200);
});