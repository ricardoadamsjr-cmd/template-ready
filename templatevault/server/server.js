////THIS FILE IS OPTIONAL-- ONLY NEEDED IF YOU WANT TO RUN THE SERVER LOCALLY////
//Uses same logic as Firebase Functions, but runs as a standalone Express server. Useful if you want to test locally without deploying to Firebase.


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        { price: "price_yourStripePriceId", quantity: 1 },
      ],
      success_url: "http://localhost:5000/success.html",
      cancel_url: "http://localhost:5000/cancel.html",
    });
    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));