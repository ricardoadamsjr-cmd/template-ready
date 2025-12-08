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




