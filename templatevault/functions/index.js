// functions/index.js
// This file is the entry point for Firebase Functions.
// It imports your function definitions from auth.js and webhook.js
// and re‑exports them so Firebase can deploy them.

const {logger} = require("firebase-functions");
const {onObjectFinalized} = require("firebase-functions/storage");


export { createCheckoutSession, stripeWebhook };





