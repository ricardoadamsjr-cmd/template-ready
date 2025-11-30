// Initialize Firebase
// Replace with your Firebase project config (from Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

// Start Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Grab DOM elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const authMessage = document.getElementById('authMessage');

// Handle Sign Up
signupForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent page reload
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  // Firebase create user
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      authMessage.textContent = "✅ Account created successfully!";
    })
    .catch((error) => {
      authMessage.textContent = "❌ Error: " + error.message;
    });
});

// Handle Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Firebase login
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      authMessage.textContent = "✅ Logged in successfully!";
      // Redirect to dashboard or homepage
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      authMessage.textContent = "❌ Error: " + error.message;
    });
});