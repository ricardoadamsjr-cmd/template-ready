// index.js

// 1. IMPORTS
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors');
const express = require('express');
const { onRequest } = require("firebase-functions/v2/https");

// --- INITIALIZATION ---

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Initialize Stripe (Ensures process.env.STRIPE_SECRET_KEY is set in Cloud Function config)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- CORS Configuration ---
// Configure CORS for all client-facing API endpoints
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://template-ready-static.onrender.com',
  /\.onrender\.com$/ // Allows any subdomain onrender.com
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

// --- API EXPRESS APP ---
const api = express();

// 2. APPLY CORS & MIDDLEWARE
api.use(cors(corsOptions)); // Apply the full CORS handler to the Express app
// The express.json() parser is needed for all routes that handle POST data
api.use(express.json()); 

// 3. YOUR HTTP ROUTE HANDLERS (consolidated into the 'api' Express app)

// A. Health Check Route
// Path: /healthcheck
api.get('/healthcheck', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'uplift-stripe-functions'
  });
});

// B. Example Subscription Route
// Path: /subscribe
api.post('/subscribe', (req, res) => {
  // Your logic here (e.g., saving user subscription preferences)
  res.json({ message: 'Subscription successful!' });
});

// C. Create Checkout Session Route (Your primary function)
// Path: /createcheckoutsession
api.post('/createCheckoutSession', async (req, res) => {
  // All validation and logic now happens inside the Express route handler

  try {
    const { email, uid } = req.body;

    // Validate required parameters
    if (!email || !uid) {
      return res.status(400).json({ 
        error: 'Missing required parameters: email and uid are required' 
      });
    }

    console.log(`Creating checkout session for user: ${email} (${uid})`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      metadata: { 
        firebaseUID: uid,
        source: 'uplift-dashboard'
      },
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_1Sb8n4EB56lmrQFkxL0aairz', // Your Stripe Price ID
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'https://your-app.onrender.com'}/dashboard.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://your-app.onrender.com'}/dashboard.html?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log(`✅ Checkout session created: ${session.id}`);

    res.json({ 
      id: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});


// 4. EXPORT: Consolidated API endpoint for all client traffic
// Deploy this function as: firebase deploy --only functions:api
exports.api = onRequest(api);

// --- STRIPE WEBHOOK HANDLER (Dedicated Function) ---

// 5. EXPORT: Dedicated Webhook function (Requires raw body for signature verification)
// Deploy this function as: firebase deploy --only functions:stripewebhook
// The onRequest wrapper handles the raw body if you don't use the express app
exports.stripewebhook = onRequest({ methods: ['POST'] }, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Raw body is required for Stripe signature verification
  const rawBody = req.rawBody; 
  if (!rawBody) {
    return res.status(400).send('Webhook Error: Request body is missing.');
  }

  let event;
  
  try {
    const sig = req.headers['stripe-signature'];
    
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    await handleStripeEvent(event);
    console.log(`✅ Successfully processed: ${event.type}`);
    res.json({ received: true, eventType: event.type });
  } catch (error) {
    console.error(`❌ Error processing ${event.type}:`, error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      eventType: event.type 
    });
  }
});


// --- HELPER FUNCTIONS (No changes needed here) ---

// Handle different Stripe webhook events
async function handleStripeEvent(event) {
  // ... (Your existing handleStripeEvent logic) ...
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
      
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
}

// Handle subscription creation/updates
async function handleSubscriptionChange(subscription) {
  const firebaseUID = subscription.metadata.firebaseUID;
  // ... (Your existing handleSubscriptionChange logic) ...
  if (!firebaseUID) {
    console.warn('⚠️ No firebaseUID in subscription metadata');
    return;
  }

  const updateData = {
    subscriptionStatus: subscription.status,
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    planId: subscription.items.data[0]?.price?.id,
    isProfessional: subscription.status === 'active',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await admin.firestore()
    .collection('users')
    .doc(firebaseUID)
    .set(updateData, { merge: true });

  console.log(`✅ Updated subscription for ${firebaseUID}: ${subscription.status}`);
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription) {
  const firebaseUID = subscription.metadata.firebaseUID;
  // ... (Your existing handleSubscriptionCanceled logic) ...
  if (!firebaseUID) {
    console.warn('⚠️ No firebaseUID in subscription metadata');
    return;
  }

  await admin.firestore()
    .collection('users')
    .doc(firebaseUID)
    .update({
      subscriptionStatus: 'canceled',
      isProfessional: false,
      canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log(`✅ Canceled subscription for ${firebaseUID}`);
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const firebaseUID = subscription.metadata.firebaseUID;
  // ... (Your existing handlePaymentSucceeded logic) ...
  if (!firebaseUID) {
    console.warn('⚠️ No firebaseUID in subscription metadata');
    return;
  }

  await admin.firestore()
    .collection('users')
    .doc(firebaseUID)
    .update({
      subscriptionStatus: 'active',
      isProfessional: true,
      lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
      lastPaymentAmount: invoice.amount_paid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log(`✅ Payment succeeded for ${firebaseUID}: $${invoice.amount_paid / 100}`);
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const firebaseUID = subscription.metadata.firebaseUID;
  // ... (Your existing handlePaymentFailed logic) ...
  if (!firebaseUID) {
    console.warn('⚠️ No firebaseUID in subscription metadata');
    return;
  }

  await admin.firestore()
    .collection('users')
    .doc(firebaseUID)
    .update({
      subscriptionStatus: 'past_due',
      isProfessional: false,
      lastFailedPayment: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  console.log(`❌ Payment failed for ${firebaseUID}`);
}


