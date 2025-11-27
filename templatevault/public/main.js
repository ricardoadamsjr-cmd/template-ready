import { signUp, logIn } from "auth.js";

document.getElementById("signup-btn").addEventListener("click", () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  signUp(email, password);
});

// auth.js

// Import the Firebase Auth instance from your firebase-config.js
import { auth } from "./firebase-config.js";

// Import the Firebase Auth functions you’ll use
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

/**
 * Sign up a new user with email and password
 * @param {string} email
 * @param {string} password
 */
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      console.log("✅ User signed up:", userCredential.user);
      return userCredential.user;
    })
    .catch(error => {
      console.error("❌ Error signing up:", error.code, error.message);
      throw error;
    });
}

/**
 * Log in an existing user with email and password
 * @param {string} email
 * @param {string} password
 */
export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      console.log("✅ User logged in:", userCredential.user);
      return userCredential.user;
    })
    .catch(error => {
      console.error("❌ Error logging in:", error.code, error.message);
      throw error;
    });
}

/**
 * Log out the current user
 */
export function logOut() {
  return signOut(auth)
    .then(() => {
      console.log("✅ User logged out");
    })
    .catch(error => {
      console.error("❌ Error logging out:", error.code, error.message);
      throw error;
    });
}

/**
 * Listen for authentication state changes
 * This runs whenever a user logs in or out
 */
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("👤 User is logged in:", user.email);
    // You can add UI updates here, e.g. show/hide content
  } else {
    console.log("🚪 No user logged in");
    // Handle logged-out state in your UI
  }
});
