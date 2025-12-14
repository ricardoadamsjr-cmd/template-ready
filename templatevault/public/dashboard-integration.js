// dashboard-integration.js
// Add this script to your existing dashboard.html to integrate Stripe functionality

// Initialize Stripe (add this after your existing scripts)
const stripe = Stripe("pk_test_51SYdDeEB56lmrQFkbRBYcsqpNGAka3olRu3nai3lbPeXeFGM4K7Ro8u7nLdlyOHsjRgnE0ALj6IVYbKRifDPIvO200lGOnKjVY");

// Global variables for subscription management
window.userSubscriptionData = null;
window.isSubscriptionActive = false;

// Function to check user's subscription status
async function checkSubscriptionStatus(uid) {
  try {
    const userDoc = await firebase.firestore().collection('users').doc(uid).get();
    const userData = userDoc.data();
    window.userSubscriptionData = userData;
    
    // Check if user has active subscription
    const isActive = userData && 
                    userData.isProfessional && 
                    userData.subscriptionStatus === 'active';
    
    window.isSubscriptionActive = isActive;
    
    // Update UI based on subscription status
    updateDashboardUI(isActive, userData);
    
    return isActive;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

// Function to update dashboard UI based on subscription status
function updateDashboardUI(isActive, userData) {
  const subscribeButton = document.getElementById('subscribebutton');
  const downloadButton = document.getElementById('downloadbutton'); // Assuming you have this
  
  if (isActive) {
    // User has active subscription
    if (subscribeButton) {
      subscribeButton.textContent = 'Subscription Active ✓';
      subscribeButton.disabled = true;
      subscribeButton.style.background = '#28a745';
      subscribeButton.style.cursor = 'default';
    }
    
    // Enable download button
    if (downloadButton) {
      downloadButton.disabled = false;
      downloadButton.style.display = 'block';
    }
    
    console.log('✅ User has active subscription');
  } else {
    // User doesn't have active subscription
    if (subscribeButton) {
      subscribeButton.textContent = 'Subscribe to Professional Plan';
      subscribeButton.disabled = false;
      subscribeButton.style.background = '#007bff';
      subscribeButton.style.cursor = 'pointer';
    }
    
    // Disable download button
    if (downloadButton) {
      downloadButton.disabled = true;
      downloadButton.style.display = 'none';
    }
    
    console.log('❌ User needs to subscribe');
  }
}

// Function to handle subscription button click
async function handleSubscribeClick() {
  const user = firebase.auth().currentUser;
  
  if (!user) {
    alert("You must be logged in to subscribe.");
    return;
  }

  // If already subscribed, don't do anything
  if (window.isSubscriptionActive) {
    alert("You already have an active subscription!");
    return;
  }

  const subscribeButton = document.getElementById('subscribebutton');
  
  // Show loading state
  const originalText = subscribeButton.textContent;
  subscribeButton.disabled = true;
  subscribeButton.textContent = "Processing...";

  try {
    console.log('Creating checkout session for:', user.email);

    // Call your Google Cloud Function
    const response = await fetch(
      "https://stripe-run-subscription-615612260052.us-east4.run.app",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const session = await response.json();
    console.log("Checkout session created:", session.id);

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId: session.id });
    
    if (result.error) {
      throw new Error(result.error.message);
    }

  } catch (err) {
    console.error("Error creating checkout session:", err);
    
    // Show user-friendly error message
    let errorMessage = "Failed to start checkout process. ";
    if (err.message.includes('404')) {
      errorMessage += "Payment service not found. Please contact support.";
    } else if (err.message.includes('500')) {
      errorMessage += "Server error. Please try again later.";
    } else {
      errorMessage += err.message;
    }
    
    alert(errorMessage);
  } finally {
    // Reset button state
    subscribeButton.disabled = false;
    subscribeButton.textContent = originalText;
  }
}

// Function to handle URL parameters (success/cancel from Stripe)
function handleStripeRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('session_id')) {
    alert('Payment successful! Your subscription is being activated.');
    // Reload subscription status after a short delay
    setTimeout(() => {
      if (firebase.auth().currentUser) {
        checkSubscriptionStatus(firebase.auth().currentUser.uid);
      }
    }, 2000);
  } else if (urlParams.get('canceled')) {
    alert('Payment was canceled. You can try again anytime.');
  }
  
  // Clean up URL
  if (urlParams.get('session_id') || urlParams.get('canceled')) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Initialize subscription functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Handle Stripe redirect parameters
  handleStripeRedirect();
  
  // Set up subscribe button click handler
  const subscribeButton = document.getElementById('subscribebutton');
  if (subscribeButton) {
    subscribeButton.addEventListener('click', handleSubscribeClick);
  } else {
    console.error("❌ No element with id='subscribebutton' found in the DOM.");
  }
  
  // Check subscription status when user auth state changes
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      checkSubscriptionStatus(user.uid);
    }
  });
});

// Export functions for testing (optional)
if (typeof window !== 'undefined') {
  window.checkSubscriptionStatus = checkSubscriptionStatus;
  window.handleSubscribeClick = handleSubscribeClick;
}