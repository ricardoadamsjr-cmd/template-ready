// Import Firebase SDKs
//Client-Side Firebase Initialization : Ensure you have a separate file (e.g., src/firebase.js or directly in src/js/main.js ) 
// that performs initializeApp for the client-side Firebase SDK
//This is where your client-side Firebase project configuration lives.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


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
const auth = getAuth(app);

export { auth, app }; // Exporting 'app' can be useful to
