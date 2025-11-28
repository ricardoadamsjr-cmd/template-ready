// index.js (at your project root - this replaces all the server-side code from your main.js)

// Server-side imports (using require for Node.js CommonJS modules)
const express = import("express");
const path = require("path");
const admin = require("firebase-admin");
const Stripe = require("stripe");
// Consider using a library like 'dotenv' to load environment variables from a .env file
require('dotenv').config(); 

// Load Firebase service account (downloaded from Firebase Console)
// IMPORTANT: Ensure 'serviceAccountKey.json' is in a secure, accessible location.
// In a real deployment, you'd load this securely via environment variables or a secret manager.
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // If you use Firebase Realtime Database on the server, include databaseURL:
  // databaseURL: "https://uplift-local.firebaseio.com" 
});

// Initialize Stripe (use your secret key from Stripe Dashboard)
// STRIPE_SECRET_KEY should be an environment variable, NOT hardcoded.
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies for API requests

// 🔒 Middleware to verify Firebase ID tokens (used for protected API routes)
async function authenticateToken(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).send("Unauthorized: No token provided");

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach decoded user info to the request
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).send("Unauthorized: Invalid token");
  }
}

// 🛠 Example protected API route (e.g., your client-side app fetches user profile from here)
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}`, uid: req.user.uid });
});

// 💳 Stripe checkout session API route (your client-side app would call this to initiate payment)
app.post("/api/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Your Stripe Price ID (from environment variables)
          quantity: 1,
        },
      ],
      // Use dynamic URLs for better flexibility
      success_url: `${req.protocol}://${req.get('host')}/success.html`, 
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
      client_reference_id: req.user.uid, // Link Stripe session to Firebase user
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).send("Error creating checkout session");
  }
});

// 📂 Serve static files (YOUR CLIENT-SIDE APPLICATION)
// This middleware serves all files from the 'templatevault/public' directory.
// This directory should contain your index.html, CSS, and the *BUILT* JavaScript files.
app.use(express.static(path.join(__dirname, "templatevault/public")));

// SPA fallback: For any routes not handled by the API or static files,
// send the index.html. This is crucial for client-side routing in React apps.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "templatevault/public", "index.html"));
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
