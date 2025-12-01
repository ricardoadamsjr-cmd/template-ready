import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

async function checkSubscription() {
  const uid = auth.currentUser.uid;
  const userDoc = await getDoc(doc(db, "users", uid));
  const status = userDoc.data()?.subscriptionStatus;

  if (status === "active") {
    document.getElementById("downloadBtn").style.display = "block";
    document.getElementById("subscribeBtn").style.display = "none";
  } else {
    document.getElementById("downloadBtn").style.display = "none";
    document.getElementById("subscribeBtn").style.display = "block";
  }
}
