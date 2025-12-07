
//Entry point for Template Vault application
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { checkSubscription } from "./dashboard"; // ✅ relative import

// Your Firebase config (make sure it's the same as in firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
  authDomain: "uplift-local.firebaseapp.com",
  projectId: "uplift-local",
  storageBucket: "uplift-local.appspot.com",
  messagingSenderId: "615612260052",
  appId: "1:615612260052:web:c7cac371c0698314e36541"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
const auth = getAuth(app);

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User signed in:", user.uid);
    checkSubscription(); // attach Firestore listener
  } else {
    console.log("No user signed in");
    // Optionally hide subscription-only UI here
  }
});

