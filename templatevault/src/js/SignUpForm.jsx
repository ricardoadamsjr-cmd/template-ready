//This is your React component that handles the sign-up UI and calls the auth-service .

// src/components/SignUpForm.jsx

import React, { useState } from 'react';
import { signUp } from '../js/auth-service'; // Import client-side signUp function
// If you have a client-side userService for Firestore, import it here:
// import { createUserProfile } from "../services/userService";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Assuming a name field
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission to avoid page reload
    setLoading(true);
    setError(null);

    try {
      const user = await signUp(email, password); // Call the client-side signUp function

      // If you have a client-side Firestore function to save user profiles:
      // await createUserProfile(user, { name }); 

      console.log("Sign-up successful:", user.uid);
      // TODO: Redirect user, show success message, clear form, etc.
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message); // Display error message to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Create Account</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
