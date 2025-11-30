// Initialize Firebase
// Replace with your Firebase project config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
  authDomain: "uplift-local.firebaseapp.com",
  projectId: "uplift-local",
  storageBucket: "uplift-local.firebasestorage.app",
  messagingSenderId: "615612260052",
  appId: "1:615612260052:web:c7cac371c0698314e36541"
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