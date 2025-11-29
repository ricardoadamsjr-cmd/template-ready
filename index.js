// index.js (at your project root)

// Server-side imports
import express from "express";
import path from "path";
import admin from "firebase-admin"; // Firebase Admin SDK
import Stripe from "stripe";
import dotenv from "dotenv"; // For loading .env variables in local development
import { fileURLToPath } from "url"; // For __dirname in ES Modules

// Load environment variables from .env file in local development.
// This will not run on Render.com, as Render handles environment variables directly.
dotenv.config();

// Recreate __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Firebase Admin SDK Initialization ---
let serviceAccount;
// We'll primarily rely on the FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON environment variable.
if (process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON);
    console.log("Firebase service account loaded from FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON.");
  } catch (e) {
    console.error("Critical Error: Failed to parse FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON.", e);
    // Exit the application if the critical service account configuration is malformed
    process.exit(1);
  }
} else {
  // In a production environment like Render.com, this variable should *always* be set.
  console.error("Critical Error: FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON environment variable is not set.");
  process.exit(1); // Exit if Firebase Admin SDK cannot be initialized without it
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Specify your Firebase project's database URL or project ID for other services.
    // Using your project ID for general Admin SDK operations is often sufficient,
    // but databaseURL is needed if you specifically interact with Realtime Database.
    databaseURL: "https://uplift-local.firebaseio.com", // Your project's Realtime Database URL
    projectId: "uplift-local", // Your Firebase Project ID
  });
  console.log("Firebase Admin SDK initialized successfully for uplift-local!");
} else {
  // This block serves as a final safeguard if serviceAccount somehow remains null.
  console.error("Firebase Admin SDK not initialized: Service account configuration is missing or invalid.");
  process.exit(1);
}

// --- Stripe Initialization ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error("Critical Error: STRIPE_SECRET_KEY environment variable is not set.");
  process.exit(1); // Exit if Stripe secret key is missing
}
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // It's good practice to pin to a recent stable API version
});
console.log("Stripe initialized.");

// --- Express App Setup ---
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies for API requests

// --- Firebase Authentication Middleware ---
// 🔒 Middleware to verify Firebase ID tokens (used for protected API routes)
async function authenticateToken(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) {
    return res.status(401).send("Unauthorized: No authentication token provided.");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach decoded user info to the request (e.g., uid, email)
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    // Provide a more informative error message for clients
    return res.status(401).send(`Unauthorized: Invalid or expired authentication token. (${error.message})`);
  }
}

// --- API Routes ---

// 🛠 Example protected API route
// This route requires a valid Firebase ID token and returns basic user information.
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.email || req.user.uid}`, // Use email if available, else UID
    uid: req.user.uid,
    authTime: req.user.auth_time, // Time when the user authenticated
  });
});

// 💳 Stripe checkout session API route
// Your client-side app will call this to initiate a Stripe payment/subscription checkout.
app.post("/api/create-checkout-session", authenticateToken, async (req, res) => {
  const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
  if (!STRIPE_PRICE_ID) {
    console.error("Critical Error: STRIPE_PRICE_ID environment variable is not set.");
    return res.status(500).send("Server configuration error: Stripe Price ID is missing.");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // Assuming you're creating a subscription here
      line_items: [
        {
          price: STRIPE_PRICE_ID, // Your specific Stripe Price ID for the product/service
          quantity: 1,
        },
      ],
      // Dynamic URLs for success/cancel pages based on the request origin
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
      client_reference_id: req.user.uid, // Link this Stripe session to the authenticated Firebase user
      customer_email: req.user.email, // Pre-fill the customer's email in Stripe Checkout
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe checkout session creation error:", error);
    res.status(500).send(`Error creating checkout session: ${error.message}`);
  }
});

// --- Static File Serving and SPA Fallback ---

// 📂 Serve static files
// This middleware serves all client-side files (HTML, CSS, JS, images)
// from the 'templatevault/public' directory. This is where your built frontend
// application files should reside.
app.use(express.static(path.join(__dirname, "templatevault/public")));


// SPA fallback: For any routes not explicitly handled by the API or static files,
// send the 'index.html'. This is essential for client-side routing in frameworks
// like React, Vue, or Angular, allowing them to manage their own routes.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "templatevault/public", "index.html"));
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
