import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function AuthApp() {
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("Logged in!");
      }
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div>
      <div className="auth-tabs">
        <button className={`tab-btn ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>Sign Up</button>
        <button className={`tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Log In</button>
      </div>

      <form className="auth-form active" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
        <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="auth-btn">{mode === "signup" ? "Create Account" : "Sign In"}</button>
      </form>

      {message && <div className="success-message">{message}</div>}

      {user && (
        <div className="logout-section active">
          <div className="user-info">
            <h3>Welcome back!</h3>
            <p>{user.email}</p>
          </div>
          <button className="logout-btn" onClick={() => signOut(auth)}>Log Out</button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("react-auth-root")).render(<AuthApp />);