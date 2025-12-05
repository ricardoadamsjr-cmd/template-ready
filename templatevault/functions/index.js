///////////// STRIPE CHECKOUT + WEBHOOK CLOUD FUNCTIONS /////////////
// Make sure you have in firebase.json:
// {
//   "functions": {
//     "runtime": "nodejs18"
//   }
// }
// And deploy with: firebase deploy --only functions

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);

admin.initializeApp();

// -------------------- CREATE CHECKOUT SESSION --------------------
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  try {
    // Basic validation
    if (!req.body.email || !req.body.uid) {
      return res.status(400).send("Missing required parameters: email or uid");
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: req.body.email,
      metadata: { firebaseUID: req.body.uid },
      mode: "subscription",
      line_items: [
        {
          price: "price_123", // TODO: replace with your real Stripe Price ID
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
const endpointSecret = functions.config().stripe.webhook_secret;

exports.stripeWebhook = functions.https.onRequest((req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // IMPORTANT: rawBody must be enabled in Firebase
      req.headers["stripe-signature"],
      endpointSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription lifecycle events
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object;
    const firebaseUID = subscription.metadata.firebaseUID;

    if (firebaseUID) {
      admin
        .firestore()
        .collection("users")
        .doc(firebaseUID)
        .update({
          subscriptionStatus: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
        })
        .then(() => {
          console.log(
            `Updated subscription for user ${firebaseUID}: ${subscription.status}`
          );
        })
        .catch((err) => {
          console.error("Error updating Firestore:", err);
        });
    } else {
      console.warn("No firebaseUID found in subscription metadata");
    }
  }

  res.sendStatus(200);
});