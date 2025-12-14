// dashboard-integration-cors-fixed.js
// Updated with correct region and enhanced CORS handling

// Initialize Stripe (make sure this runs after Stripe script loads)
let stripe;
try {
  stripe = Stripe("pk_test_51SYdDeEB56lmrQFkbRBYcsqpNGAka3olRu3nai3lbPeXeFGM4K7Ro8u7nLdlyOHsjRgnE0ALj6IVYbKRifDPIvO200lGOnKjVY");
  console.log("✅ Stripe initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Stripe:", error);
}

// Global variables for subscription management
window.userSubscriptionData = null;
window.isSubscriptionActive = false;

// Configuration with CORRECT region
const CONFIG = {
  // Updated with your actual Cloud Function URL
  CLOUD_FUNCTION_URLS: [
    "https://northamerica-northeast1-uplift-local.cloudfunctions.net/createCheckoutSession", // Your actual endpoint
    "https://us-central1-uplift-local.cloudfunctions.net/createCheckoutSession", // Fallback
    "https://createcheckoutsession-uplift-local.cloudfunctions.net/" // Alternative format
  ],
  RETRY_ATTEMPTS: 3,
  TIMEOUT: 15000 // 15 seconds for better reliability
};

// Function to check user's subscription status
async function checkSubscriptionStatus(uid) {
  try {
    // Ensure Firebase is initialized
    if (!firebase || !firebase.firestore) {
      throw new Error("Firebase not initialized");
    }

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
    
    console.log("✅ Subscription status checked:", isActive ? "Active" : "Inactive");
    return isActive;
  } catch (error) {
    console.error('❌ Error checking subscription status:', error);
    return false;
  }
}

// Function to update dashboard UI based on subscription status
function updateDashboardUI(isActive, userData) {
  const subscribeButton = document.getElementById('subscribebutton');
  const downloadButton = document.getElementById('downloadbutton');
  
  if (isActive) {
    // User has active subscription
    if (subscribeButton) {
      subscribeButton.textContent = 'Subscription Active ✓';
      subscribeButton.disabled = true;
      subscribeButton.style.background = '#28a745';
      subscribeButton.style.cursor = 'default';
      subscribeButton.style.opacity = '0.8';
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
      subscribeButton.style.opacity = '1';
    }
    
    // Disable download button
    if (downloadButton) {
      downloadButton.disabled = true;
      downloadButton.style.display = 'none';
    }
    
    console.log('❌ User needs to subscribe');
  }
}

// Enhanced function to create checkout session with proper CORS handling
async function createCheckoutSession(email, uid) {
  const payload = {
    email: email,
    uid: uid,
    timestamp: new Date().toISOString()
  };

  console.log("🔄 Attempting to create checkout session for:", email);

  for (let i = 0; i < CONFIG.CLOUD_FUNCTION_URLS.length; i++) {
    const url = CONFIG.CLOUD_FUNCTION_URLS[i];
    console.log(`🔄 Trying endpoint ${i + 1}/${CONFIG.CLOUD_FUNCTION_URLS.length}:`, url);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

      // Enhanced headers for CORS
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };

      // Add origin header explicitly
      if (window.location.origin) {
        headers["Origin"] = window.location.origin;
      }

      console.log("📡 Request headers:", headers);
      console.log("📡 Request payload:", payload);

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit' // Don't send credentials unless needed
      });

      clearTimeout(timeoutId);

      console.log(`📡 Response status: ${response.status}`);
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const session = await response.json();
        console.log("✅ Checkout session created successfully:", session);
        return session;
      } else {
        const errorText = await response.text();
        console.error(`❌ HTTP ${response.status} from ${url}:`, errorText);
        
        // If this is the last URL, throw the error
        if (i === CONFIG.CLOUD_FUNCTION_URLS.length - 1) {
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error with ${url}:`, error);
      
      // Specific CORS error handling
      if (error.message.includes('CORS') || error.message.includes('cors')) {
        console.error("🚫 CORS Error Details:", {
          url: url,
          origin: window.location.origin,
          error: error.message
        });
      }
      
      // If this is the last URL, throw the error
      if (i === CONFIG.CLOUD_FUNCTION_URLS.length - 1) {
        throw error;
      }
    }
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
  
  if (!subscribeButton) {
    console.error("❌ Subscribe button not found");
    return;
  }

  // Show loading state
  const originalText = subscribeButton.textContent;
  const originalStyle = {
    disabled: subscribeButton.disabled,
    background: subscribeButton.style.background,
    cursor: subscribeButton.style.cursor
  };

  subscribeButton.disabled = true;
  subscribeButton.textContent = "Processing...";
  subscribeButton.style.background = "#6c757d";
  subscribeButton.style.cursor = "wait";

  try {
    console.log('🚀 Starting subscription process for:', user.email);
    console.log('🌐 Current origin:', window.location.origin);

    // Validate Stripe initialization
    if (!stripe) {
      throw new Error("Stripe not initialized. Please refresh the page.");
    }

    // Create checkout session
    const session = await createCheckoutSession(user.email, user.uid);

    if (!session || !session.id) {
      throw new Error("Invalid session response from server");
    }

    console.log("🔄 Redirecting to Stripe Checkout...");

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId: session.id });
    
    if (result.error) {
      throw new Error(result.error.message);
    }

  } catch (err) {
    console.error("❌ Subscription error:", err);
    
    // Show user-friendly error message
    let errorMessage = "Failed to start checkout process.\n\n";
    
    if (err.message.includes('CORS') || err.message.includes('cors')) {
      errorMessage += "🚫 CORS Error: The payment service is not configured to accept requests from this website.\n\n";
      errorMessage += "Technical details:\n";
      errorMessage += `• Your site: ${window.location.origin}\n`;
      errorMessage += `• Function URL: https://northamerica-northeast1-uplift-local.cloudfunctions.net/createCheckoutSession\n\n`;
      errorMessage += "This needs to be fixed in your Cloud Function CORS configuration.\n";
      errorMessage += "Please contact support with this error message.";
    } else if (err.message.includes('404') || err.message.includes('not found')) {
      errorMessage += "❌ Payment service not found.\n";
      errorMessage += "The Cloud Function may not be deployed or the URL is incorrect.";
    } else if (err.message.includes('500')) {
      errorMessage += "❌ Server error. Please try again in a few minutes.";
    } else if (err.message.includes('timeout') || err.message.includes('aborted')) {
      errorMessage += "❌ Request timed out. Please check your internet connection and try again.";
    } else {
      errorMessage += `❌ ${err.message}`;
    }
    
    alert(errorMessage);
  } finally {
    // Reset button state
    subscribeButton.disabled = originalStyle.disabled;
    subscribeButton.textContent = originalText;
    subscribeButton.style.background = originalStyle.background;
    subscribeButton.style.cursor = originalStyle.cursor;
  }
}

// Function to handle URL parameters (success/cancel from Stripe)
function handleStripeRedirect() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('session_id')) {
    console.log("✅ Payment successful, session ID:", urlParams.get('session_id'));
    alert('🎉 Payment successful! Your subscription is being activated...');
    
    // Reload subscription status after a short delay
    setTimeout(() => {
      if (firebase.auth().currentUser) {
        checkSubscriptionStatus(firebase.auth().currentUser.uid);
      }
    }, 2000);
  } else if (urlParams.get('canceled')) {
    console.log("❌ Payment canceled by user");
    alert('Payment was canceled. You can try again anytime.');
  }
  
  // Clean up URL
  if (urlParams.get('session_id') || urlParams.get('canceled')) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Debug function to test CORS and connectivity
async function testCORSConnectivity() {
  console.log("🔍 Testing CORS connectivity...");
  console.log("🌐 Current origin:", window.location.origin);
  
  for (const url of CONFIG.CLOUD_FUNCTION_URLS) {
    console.log(`\n🔄 Testing: ${url}`);
    
    try {
      // Test OPTIONS request (CORS preflight)
      const optionsResponse = await fetch(url, { 
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log(`  OPTIONS: ${optionsResponse.status} ${optionsResponse.statusText}`);
      console.log(`  CORS headers:`, Object.fromEntries(optionsResponse.headers.entries()));
      
    } catch (error) {
      console.log(`  ❌ OPTIONS error: ${error.message}`);
    }
    
    try {
      // Test actual POST request
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          email: 'test@example.com',
          uid: 'test123'
        })
      });
      console.log(`  POST: ${postResponse.status} ${postResponse.statusText}`);
      
      if (postResponse.ok) {
        console.log(`  ✅ SUCCESS! This endpoint works.`);
        return url;
      }
      
    } catch (error) {
      console.log(`  ❌ POST error: ${error.message}`);
    }
  }
  
  console.log("\n❌ No working endpoints found!");
  return null;
}

// Initialize subscription functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 Dashboard integration initializing...");
  console.log("🌐 Current origin:", window.location.origin);
  
  // Test CORS connectivity in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(testCORSConnectivity, 1000);
  }
  
  // Handle Stripe redirect parameters
  handleStripeRedirect();
  
  // Set up subscribe button click handler
  const subscribeButton = document.getElementById('subscribebutton');
  if (subscribeButton) {
    subscribeButton.addEventListener('click', handleSubscribeClick);
    console.log("✅ Subscribe button event listener attached");
  } else {
    console.error("❌ No element with id='subscribebutton' found in the DOM.");
    console.log("Available buttons:", document.querySelectorAll('button'));
  }
  
  // Check subscription status when user auth state changes
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log("👤 User authenticated:", user.email);
      checkSubscriptionStatus(user.uid);
    } else {
      console.log("👤 User not authenticated");
    }
  });
});

// Export functions for testing and debugging
if (typeof window !== 'undefined') {
  window.checkSubscriptionStatus = checkSubscriptionStatus;
  window.handleSubscribeClick = handleSubscribeClick;
  window.testCORSConnectivity = testCORSConnectivity;
  window.createCheckoutSession = createCheckoutSession;
}

console.log("📦 Dashboard integration script loaded with CORS fixes");