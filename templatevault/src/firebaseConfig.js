
// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // optional if you use storage

// Replace these values with your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
    authDomain: "uplift-local.firebaseapp.com",
    projectId: "uplift-local",
    storageBucket: "uplift-local.firebasestorage.app",
    messagingSenderId: "615612260052",
    appId: "1:615612260052:web:c7cac371c0698314e36541"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // optional
