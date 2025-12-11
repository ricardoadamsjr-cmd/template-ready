
//Entry point for Template Vault application
import { auth } from "firebase";
import { checkSubscription } from "dashboard";

auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User signed in:", user.uid);
    checkSubscription(); // attach Firestore listener
  } else {
    console.log("No user signed in");
    // Optionally hide subscription-only UI here
  }
});
