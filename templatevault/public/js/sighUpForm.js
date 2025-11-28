// src/components/SignUpForm.jsx

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // your firebase.js config
import { createUserProfile } from "../services/userService";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create user in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Store profile in Firestore
      await createUserProfile(user, { name });

      console.log("Sign-up successful:", user.uid);
      // TODO: redirect to dashboard or welcome page
    } catch (err) {
      console.error("Sign-up error:", err);
      setError(err.message);
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

