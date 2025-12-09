// -------------------- IMPORTS --------------------
// auth.js
//- auth.js contains your createCheckoutSession function (Stripe Checkout session creation).
//webhook.js contains your stripeWebhook function (Stripe webhook listener).
//index.js simply re‑exports them so Firebase can discover and deploy both functions.
//You don’t need to initialize Stripe or Firebase Admin in index.js anymore — that logic lives inside auth.js and webhook.js.
// functions/index.js

// Import your function definitions from other files
import { createCheckoutSession } from "./auth.js";
import { stripeWebhook } from "./webhook.js";

// Re‑export them so Firebase CLI sees them
export { createCheckoutSession, stripeWebhook };



