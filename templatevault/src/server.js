const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_your_secret_key_here'); // Secret key

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/create-subscription', async (req, res) => {
  try {
    const { token, plan, email } = req.body;

    // 1. Create customer in Stripe
    const customer = await stripe.customers.create({
      email,
      source: token, // attach card token
    });

    // 2. Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: 'price_your_stripe_price_id' }], // replace with actual price ID
    });

    res.json({ success: true, subscriptionId: subscription.id });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
