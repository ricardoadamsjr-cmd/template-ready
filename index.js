// index.js (at your project root - this replaces all the server-side code from your main.js)

// Server-side imports (using ES6 modules)
import express from "express";
import path from "path";
import admin from "firebase-admin";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// index.js (Server-Side Code)

// ... (your existing imports and Express setup)

// Initialize Firebase Admin SDK
// This logic handles both local (.env file path) and Render (environment variable JSON) environments
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH); // For local dev with .env
} else {
  // Fallback if neither env var is set (e.g., local dev without .env)
  console.warn("FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON or FIREBASE_SERVICE_ACCOUNT_PATH not set. Ensure serviceAccountKey.json is available for local testing if needed.");
  // You might want to throw an error here in production if it's not found
  // throw new Error("Firebase service account configuration missing!");
}

if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://uplift-local.firebaseio.com"
    });
} else {
    // Handle case where serviceAccount couldn't be loaded (e.g., don't initialize admin)
    console.error("Firebase Admin SDK not initialized due to missing service account config.");
}

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
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "templatevault/public")));


// SPA fallback: For any routes not handled by the API or static files,
// send the index.html. This is crucial for client-side routing in React apps.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "templatevault/public", "index.html"));
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
