#!/bin/bash

# Deploy script for Uplift Stripe Functions
echo "🚀 Deploying Uplift Stripe Functions to Google Cloud..."

# Configuration - UPDATE THESE VALUES
PROJECT_ID="uplift-local"  # Your Firebase project ID
REGION="us-central1"       # Keep same region as your current setup

# Validate environment variables
echo "🔍 Checking environment variables..."

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ Error: STRIPE_SECRET_KEY environment variable is not set"
    echo "Please set it with: export STRIPE_SECRET_KEY=sk_test_your_key"
    exit 1
fi

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "❌ Error: STRIPE_WEBHOOK_SECRET environment variable is not set"
    echo "Please set it with: export STRIPE_WEBHOOK_SECRET=whsec_your_secret"
    exit 1
fi

if [ -z "$STRIPE_PRICE_ID" ]; then
    echo "⚠️  Warning: STRIPE_PRICE_ID not set, using default"
    STRIPE_PRICE_ID="price_1Sb8n4EB56lmrQFkxL0aairz"
fi

if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  Warning: FRONTEND_URL not set, using placeholder"
    FRONTEND_URL="https://your-app.onrender.com"
fi

echo "✅ Environment variables validated"

# Deploy createCheckoutSession function
echo "📦 Deploying createCheckoutSession function..."
gcloud functions deploy createCheckoutSession \
  --gen2 \
  --runtime=nodejs18 \
  --region=$REGION \
  --source=. \
  --entry-point=createCheckoutSession \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=60s \
  --memory=256MB \
  --set-env-vars="STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,STRIPE_PRICE_ID=$STRIPE_PRICE_ID,FRONTEND_URL=$FRONTEND_URL" \
  --project=$PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy createCheckoutSession function"
    exit 1
fi

echo "✅ createCheckoutSession deployed successfully!"

# Deploy stripeWebhook function
echo "📦 Deploying stripeWebhook function..."
gcloud functions deploy stripeWebhook \
  --gen2 \
  --runtime=nodejs18 \
  --region=$REGION \
  --source=. \
  --entry-point=stripeWebhook \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=60s \
  --memory=256MB \
  --set-env-vars="STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET" \
  --project=$PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy stripeWebhook function"
    exit 1
fi

echo "✅ stripeWebhook deployed successfully!"

# Deploy healthCheck function
echo "📦 Deploying healthCheck function..."
gcloud functions deploy healthCheck \
  --gen2 \
  --runtime=nodejs18 \
  --region=$REGION \
  --source=. \
  --entry-point=healthCheck \
  --trigger-http \
  --allow-unauthenticated \
  --timeout=30s \
  --memory=128MB \
  --project=$PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy healthCheck function"
    exit 1
fi

echo "✅ healthCheck deployed successfully!"

echo ""
echo "🎉 All functions deployed successfully!"
echo ""
echo "📋 Your Function URLs:"
echo "   createCheckoutSession: https://$REGION-$PROJECT_ID.cloudfunctions.net/createCheckoutSession"
echo "   stripeWebhook: https://$REGION-$PROJECT_ID.cloudfunctions.net/stripeWebhook"
echo "   healthCheck: https://$REGION-$PROJECT_ID.cloudfunctions.net/healthCheck"
echo ""
echo "🔗 Next Steps:"
echo "1. Update your dashboard.html to use the createCheckoutSession URL above"
echo "2. Go to Stripe Dashboard → Webhooks"
echo "3. Add endpoint: https://$REGION-$PROJECT_ID.cloudfunctions.net/stripeWebhook"
echo "4. Select these events:"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "5. Copy the webhook secret and update STRIPE_WEBHOOK_SECRET"
echo ""
echo "🧪 Test your setup:"
echo "   curl https://$REGION-$PROJECT_ID.cloudfunctions.net/healthCheck"