import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
  authDomain: "uplift-local.firebaseapp.com",
  projectId: "uplift-local",
  storageBucket: "uplift-local.appspot.com",   // ⚠️ corrected domain
  messagingSenderId: "615612260052",
  appId: "1:615612260052:web:c7cac371c0698314e36541"
};

// Initialize Firebase v9
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
