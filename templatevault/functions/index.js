///////////THIS CALLS YOUR BACKEND TO CREATE A STRIPE CHECKOUT SESSION///////////


// The whole file is needed for this function to work and what is does is create a Stripe checkout session

//These const veriables are required for the function to work functions is needed to create the cloud function admin is needed to access firestore and stripe is needed to create the checkout session
//admin is initialized and firestore database is assigned to db variable
//Stripe is initialized with the secret key from environment variables
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create checkout session
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

//This sets up an express app with CORS and JSON parsing middleware that will handle HTTP requests for creating checkout sessions
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Create a Stripe Checkout Session
//this last section creates a POST endpoint /create-checkout-session that creates a Stripe checkout session for a subscription when called
//It specifies payment method types, subscription mode, line items with a price ID, and success/cancel URLs
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "price_yourStripePriceId", // from Stripe Dashboard
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5000/success.html",
      cancel_url: "http://localhost:5000/cancel.html",
    });
    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.api = functions.https.onRequest(app);

