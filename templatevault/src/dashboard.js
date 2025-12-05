//____________Check Subscription Status and Update UI____________//

import { auth, db } from "./firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

async function checkSubscription() {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No user signed in");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  // Option A: one-time check
  const userDoc = await getDoc(userRef);
  const status = userDoc.data()?.subscriptionStatus;

  updateUI(status);

  // Option B: realtime listener
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
