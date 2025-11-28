// src/js/auth-service.js
//This file contains your client-side functions for user authentication.

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./Firebase-client-config"; // Import the auth instance you exported

/**
 * Sign up a new user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>} The signed-up user object
 */
export async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ User signed up:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Error signing up:", error.code, error.message);
    throw error; // Re-throw to be handled by the calling component
  }
}

/**
 * Log in a user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>} The logged-in user object
 */
export async function logIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Error logging in:", error.code, error.message);
    throw error;
  }
}

/**
 * Logs out the current user.
 * @returns {Promise<void>}
 */
export function logOut() {
  return signOut(auth);
}

// You might also add functions for password reset, email verification, etc.
