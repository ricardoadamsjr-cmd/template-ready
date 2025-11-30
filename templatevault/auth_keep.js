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

// Initialize Firebase with the configuration object (firebaseConfig)
// This object usually contains keys and identifiers for your Firebase project,
// such as apiKey, authDomain, projectId, etc.
// Calling initializeApp() sets up a connection between your app and Firebase services.
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Create a reference to the Firebase Authentication service
// The 'auth' constant now gives you access to methods for user authentication,
// such as signing in, signing out, creating accounts, and monitoring auth state.
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const authMessage = document.getElementById('authMessage');

// Attach an event listener to the signup form.
// This listens for the 'submit' event (when the user clicks the submit button).
signupForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent page reload
  const email = document.getElementById('signupEmail').value;// Grab the value entered into the email input field.
  const password = document.getElementById('signupPassword').value;// Grab the value entered into the password input field.

  // Firebase create user
  // Use Firebase Authentication to create a new user account
// with the provided email and password.
// If the account creation succeeds, this .then() block runs.
    // 'userCredential' contains information about the newly created user,
    // such as their UID and email.
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      authMessage.textContent = "✅ Account created successfully!";// Update the page to show a success message to the user.
    })
    .catch((error) => {
      authMessage.textContent = "❌ Error: " + error.message;
    });
});

// Handle Login
// Attach an event listener to the login form.// This listens for the 'submit' event (when the user clicks the login button).
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();// Prevent the default form submission behavior.
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Firebase login
  // Use Firebase Authentication to sign in a user
  // with the provided email and password.
  auth.signInWithEmailAndPassword(email, password)// If login succeeds, this .then() block runs.// 'userCredential' contains details about the logged-in user,// such as their UID and email.
    .then((userCredential) => {
      authMessage.textContent = "✅ Logged in successfully!";
      // Redirect to dashboard or homepage
      // Redirect the user to another page (dashboard.html).
      // This is a common step after login so the user lands
      // on their personalized dashboard or homepage.
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      authMessage.textContent = "❌ Error: " + error.message;
    });
});
console.log("Auth script loaded");