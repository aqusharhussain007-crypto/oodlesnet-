"use client";

import { useState } from "react";

export default function AdminLoginView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Import everything ONLY on the client
      const { auth } = await import("@/lib/firebase-auth");
      const { signInWithEmailAndPassword } = await import("firebase/auth");

      await signInWithEmailAndPassword(auth, email, password);

      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError("Invalid email or password");
    }

    setLoading(false);
  }

  return (
    <main className="page-container" style={{ maxWidth: "400px" }}>
      <h1>Admin Login</h1>

      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          className="search-bar"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "15px" }}
        />

        <input
          type="password"
          className="search-bar"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "15px" }}
        />

        <button className="btn-glow" style={{ width: "100%" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
        }
    
