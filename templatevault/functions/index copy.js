//eslint-disable-next-line no-unused-vars
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";

// Import your other functions
import { stripeWebhook } from "./webhook.js";
import { createCheckoutSession } from "./auth.js";

// Example usage - create a simple HTTP function
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

// Export your other functions
export { stripeWebhook, createCheckoutSession };