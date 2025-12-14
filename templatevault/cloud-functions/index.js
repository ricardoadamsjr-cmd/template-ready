// Fixed index.js for Google Cloud Functions
const admin = require('firebase-admin');
const Stripe = require('stripe');
const cors = require('cors')({ origin: true });

  res.set('Access-Control-Allow-Origin', 'https://template-ready-static.onrender.com');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configure CORS to allow requests from your Render.com frontend
const corsHandler = cors({ 
  origin: [
    'http://localhost:3000',
    'http://localhost:8080', 
    'https://template-ready-static.onrender.com', // Replace with your actual Render.com URL
    /\.onrender\.com$/ // Allow any onrender.com subdomain
  ],
  credentials: true 
});
app.use(cors({
  origin: 'https://template-ready-static.onrender.com', // allow your frontend
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
////////////////////////////////////////////////////////////////
// Example route
app.post('/subscribe', (req, res) => {
  res.json({ message: 'Subscription successful!' });
});
// Create Checkout Session Function - MAIN EXPORT
exports.createcheckoutsession = (req, res) => {
  corsHandler(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

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
};

// Stripe Webhook Handler
exports.stripewebhook = (req, res) => {
  // No CORS for webhooks - Stripe doesn't need it
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let event;
  
  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = req.rawBody || req.body;
    
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
  handleStripeEvent(event)
    .then(() => {
      console.log(`✅ Successfully processed: ${event.type}`);
      res.json({ received: true, eventType: event.type });
    })
    .catch((error) => {
      console.error(`❌ Error processing ${event.type}:`, error);
      res.status(500).json({ 
        error: 'Webhook processing failed',
        eventType: event.type 
      });
    });
};

// Health check function
exports.healthcheck = (req, res) => {
  corsHandler(req, res, () => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'uplift-stripe-functions'
    });
  });
};

// Handle different Stripe webhook events
async function handleStripeEvent(event) {
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