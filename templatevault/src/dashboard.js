//____________Check Subscription Status and Update UI____________//

import { getAuth } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Initialize Firebase (make sure you have your config object here)
const firebaseConfig = {
    apiKey: "AIzaSyBhsMRHyuWF-R9MyRKKjzGQC0p-eznYILE",
    authDomain: "uplift-local.firebaseapp.com",
    projectId: "uplift-local",
    storageBucket: "uplift-local.appspot.com",
    messagingSenderId: "615612260052",
    appId: "1:615612260052:web:c7cac371c0698314e36541"
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

