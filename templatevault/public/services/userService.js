// src/services/userService.js

import { db } from "../firebase"; // your firebase.js config file
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

/**
 * Create a new user profile in Firestore after Firebase Auth sign-up.
 * @param {Object} user - Firebase Auth user object
 * @param {Object} extraData - Optional additional fields (e.g. name, role)
 */
export async function createUserProfile(user, extraData = {}) {
  if (!user) throw new Error("No user provided");

  const userRef = doc(db, "users", user.uid);

  const profileData = {
    email: user.email,
    createdAt: new Date(),
    subscriptionStatus: "free", // default until Stripe upgrade
    ...extraData,
  };

  try {
    await setDoc(userRef, profileData);
    console.log("User profile created:", profileData);
    return profileData;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * Get a user profile from Firestore.
 * @param {string} uid - Firebase Auth user UID
 */
export async function getUserProfile(uid) {
  if (!uid) throw new Error("No UID provided");

  const userRef = doc(db, "users", uid);

  try {
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      console.warn("No profile found for UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * Update fields in a user profile.
 * @param {string} uid - Firebase Auth user UID
 * @param {Object} updates - Fields to update
 */
export async function updateUserProfile(uid, updates) {
  if (!uid) throw new Error("No UID provided");

  const userRef = doc(db, "users", uid);

  try {
    await updateDoc(userRef, updates);
    console.log("User profile updated:", updates);
    return updates;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
