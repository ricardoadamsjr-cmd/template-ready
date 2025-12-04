// test.js
import { registerUser, listenToUserProfile } from "./firebaseClient.js";

async function runTest() {
  try {
    // 1. Register a new user (Auth + Firestore write)
    const user = await registerUser("ric+demo@example.com", "Str0ngP@ss!", "pro");
    console.log("User registered:", user.uid);

    // 2. Start listening for real-time updates to that user's profile
    const unsubscribe = listenToUserProfile(user.uid, (profile) => {
      console.log("Realtime profile update:", profile);
    });

    // 3. Keep the listener running until you stop it
    // For demo purposes, stop after 60 seconds
    setTimeout(() => {
      unsubscribe();
      console.log("Stopped listening.");
    }, 60000);

  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
