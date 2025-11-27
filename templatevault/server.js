// server.js
// server.js
const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// Load Firebase service account (downloaded from Firebase Console)
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<your-project-id>.firebaseio.com"
});

// Initialize Stripe (use your secret key from Stripe Dashboard)
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json()); // Parse JSON bodies

// 🔒 Middleware to verify Firebase ID tokens
async function authenticateToken(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).send("Unauthorized");

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).send("Invalid token");
  }
}

// 🛠 Example protected route
app.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}`, uid: req.user.uid });
});

// 💳 Stripe checkout session route
app.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Your Stripe price ID
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success.html",
      cancel_url: "http://localhost:3000/cancel.html",
      client_reference_id: req.user.uid, // Link Stripe session to Firebase user
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).send("Error creating checkout session");
  }
});

// 📂 Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback (important if using React/Vue/Angular)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

                           