const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid; // Firebase user ID
  const customer = await stripe.customers.create({ metadata: { firebaseUID: uid } });

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [{ price: "price_12345", quantity: 1 }],
    mode: "subscription",
    success_url: "https://yourapp.com/dashboard?success=true",
    cancel_url: "https://yourapp.com/dashboard?canceled=true",
  });

  return { url: session.url };
});


exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    req.headers["stripe-signature"],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const subscription = event.data.object;
    const firebaseUID = subscription.metadata.firebaseUID;

    await db.collection("users").doc(firebaseUID).set({
      subscriptionStatus: subscription.status, // "active", "canceled"
    }, { merge: true });
  }

  res.json({ received: true });
});
