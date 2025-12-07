//____________Check Subscription Status and Update UI____________//

import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Initialize Firebase (make sure you have your config object here)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function checkSubscription() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  // Realtime listener keeps UI updated automatically
  onSnapshot(userRef, (snapshot) => {
    const status = snapshot.data()?.subscriptionStatus;
    updateUI(status);
  });
}

function updateUI(status) {
  const downloadBtn = document.getElementById("downloadBtn");
  const subscribeBtn = document.getElementById("subscribeBtn");

  if (status === "active") {
    downloadBtn.style.display = "block";
    subscribeBtn.style.display = "none";
  } else {
    downloadBtn.style.display = "none";
    subscribeBtn.style.display = "block";
  }
}

