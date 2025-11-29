// src/js/auth-service.js
//This file contains your client-side functions for user authentication.

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./Firebase-client-config"; // Import the auth instance you exported
import { getAuth} from "firebase/auth";
import { app } from '../firebase-client-config'; // Assuming you export 'app' from there
import { db } from '../firebase-client-config'; // Import the Firestore instance
import { doc, setDoc } from "firebase/firestore";
// Get the Firebase Auth instance
const auth = getAuth(app); // Pass the initialized app to getAuth()

export async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // User signed up and signed in automatically
    return userCredential.user;
  } catch (error) {
    console.error("Firebase Auth Sign-up Error:", error.code, error.message);
    throw error; // Re-throw to be caught by the calling component
  }
}
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

export async function createUserProfile(user, data) {
  if (!user || !user.uid) {
    console.error("Cannot create user profile: User object is invalid.");
    return;
  }

  try {
    
    //doc(db, "users", user.uid) : 
    // This creates a reference to a specific document in the users collection, 
    // using the user's unique uid from Firebase Authentication as the document ID. 
    // This is a common and recommended practice.
    const userDocRef = doc(db, "users", user.uid);

    // Use setDoc to create or overwrite the document for this user
    //setDoc() : This function either creates a new document at the 
    // specified path ( users/user.uid ) or overwrites it if it already exists. 
    // merge: true is important here as it will merge new fields with existing ones, 
    // rather than replacing the entire document.
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: data.name || null, // Use the name passed, or null if not provided
      createdAt: new Date(),
      // Add any other default profile fields you need
      ...data // Merge any additional data provided
    }, { merge: true }); // Use merge: true to avoid overwriting existing fields if they exist

    console.log(`User profile for ${user.uid} created/updated successfully.`);
  } catch (error) {
    console.error("Error creating user profile in Firestore:", error);
    throw error;
  }
}