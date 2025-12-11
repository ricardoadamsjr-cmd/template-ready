import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import { stripeWebhook } from "./webhook.js";
import { createCheckoutSession } from "./auth.js";

export const helloWorld = onRequest({ cors: true, region: "us-central1" }, (request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.json({ message: "Hello from Firebase!", timestamp: new Date().toISOString() });
});

export const webhook = onRequest({ cors: false, region: "us-central1", rawBody: true }, stripeWebhook);
export const checkout = onRequest({ cors: true, region: "us-central1", methods: ["POST"] }, createCheckoutSession);
export { stripeWebhook, createCheckoutSession };