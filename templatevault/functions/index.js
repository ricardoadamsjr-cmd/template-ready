// functions/index.js
// This file is the entry point for Firebase Functions.
// It imports your function definitions from auth.js and webhook.js
// and re‑exports them so Firebase can deploy them.

import { createCheckoutSession } from "auth.js";
import { stripeWebhook } from "webhook.js";

export { createCheckoutSession, stripeWebhook };





