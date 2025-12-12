
//Entry point for Template Vault application
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
//the bolow imported to dashboard.js it is called when the user signs in from the dashboard component
import { checkSubscription } from "./dashboard"; // make sure this path is correct

// Your Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
    authDomain: "uplift-local.firebaseapp.com",
    projectId: "uplift-local",
    storageBucket: "uplift-local.firebasestorage.app",
    messagingSenderId: "615612260052",
    appId: "1:615612260052:web:c7cac371c0698314e36541"
};

// Initialize Firebase and attach Firestore listener to user state changes and check subscription status when user signs in
//and it is called when the user signs in or when the app starts and the user is already signed in and the app starts to listen for changes in the user's authentication state
//This is a common pattern in Firebase applications to ensure that the app can respond to changes in the user's authentication state
//which file 
const app = initializeApp(firebaseConfig);
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

