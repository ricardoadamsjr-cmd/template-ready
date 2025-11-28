const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
const Stripe = require("stripe");
import { auth } from "../firebase"; // adjust path to your firebase config
import { signUp, logIn } from "auth.js";


// 📂 Serve static files (frontend)////////////////
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback (important if using React/Vue/Angular)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Start server//////////
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
////////////////end points to static files website//////////////////////


document.getElementById("signup-btn").addEventListener("click", () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  signUp(email, password);
});

// server.js
// server.js


// Load Firebase service account (downloaded from Firebase Console)
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://uplift-local.firebaseio.com"
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







/////////////////////////////////////FORM SUBMITTION LOGIC////////////////////////////



// src/components/SignUpForm.jsx


import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUserProfile } from "../services/userService";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create user in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Store profile in Firestore
      await createUserProfile(user, { name });

      console.log("Sign-up successful:", user.uid);
      // TODO: redirect to dashboard or welcome page
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Create Account</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  ); 
}

