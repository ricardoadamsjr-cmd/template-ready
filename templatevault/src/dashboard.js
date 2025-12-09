//____________Check Subscription Status and Update UI____________//

import { auth, db } from "firebase";
import { doc, onSnapshot } from "firebase/firestore";

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

