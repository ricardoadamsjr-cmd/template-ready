// -------------------- IMPORTS --------------------
// auth.js
//- auth.js contains your createCheckoutSession function (Stripe Checkout session creation).
//webhook.js contains your stripeWebhook function (Stripe webhook listener).
//index.js simply re‑exports them so Firebase can discover and deploy both functions.
//You don’t need to initialize Stripe or Firebase Admin in index.js anymore — that logic lives inside auth.js and webhook.js.
export { createCheckoutSession } from "auth.js";
export { stripeWebhook } from "webhook.js";
//Flow Recap
  //User clicks Subscribe → frontend calls /createCheckoutSession.
  //Firebase Hosting rewrite routes that request to the createCheckoutSession function.
 //Stripe Checkout session is created → frontend redirects user to Stripe Checkout.
// Stripe processes payment → sends events to /stripeWebhook.
 //osting rewrite routes /stripeWebhook to your stripeWebhook function.
 //Webhook updates Firestore with subscription status.





