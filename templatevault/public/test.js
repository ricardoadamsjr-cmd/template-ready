// test.js
import { signUpAndRecordUser } from "./firebaseClient.js";

(async () => {
  try {
    const user = await signUpAndRecordUser("Bob+test@example.com", "Str0ngP@ss!");
    console.log("Signed up:", user.uid);
  } catch (e) {
    console.error("Signup or write error:", e.code, e.message);
  }
})();
