import express from "express";
import admin from "firebase-admin";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path"; // <--- ADDED: Import the path module

dotenv.config();

const app = express();
app.use(express.json());

// Firebase Admin setup
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_CONFIG_JSON);
}
if (!serviceAccount) {
  throw new Error("Firebase service account config missing!");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Stripe setup
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware to verify Firebase ID token
async function authenticateToken(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).send("Unauthorized: No token provided");

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).send("Unauthorized: Invalid token");
  }
}

// Example protected route
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({ email: req.user.email, uid: req.user.uid });
});

// Stripe checkout route (future use)
app.post("/api/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${req.protocol}://${req.get("host")}/success.html`,
      cancel_url: `${req.protocol}://${req.get("host")}/cancel.html`,
      client_reference_id: req.user.uid,
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).send("Error creating checkout session");
  }
});

// --- NEW STATIC FILE SERVING CONFIGURATION ---

// Serve static files from the 'frontend' directory
// This allows your HTML to link to CSS, JS, images, etc. inside 'frontend'
// e.g., if you have 'frontend/styles.css', it will be accessible at '/styles.css'
app.use(express.static(path.join(__dirname, '../../frontend'))); // <--- ADJUSTED PATH

// Explicitly send the index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend', 'index.html')); // <--- ADJUSTED PATH
});

// --- END NEW STATIC FILE SERVING CONFIGURATION ---

// Define port and start listening
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend service listening on port ${port}`);
});
