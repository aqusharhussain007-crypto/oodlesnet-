"use client";

import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function login(e) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError("Invalid login.");
    }
  }

  return (
    <main className="page-container">
      <h1>Admin Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={login} style={{ marginTop: "20px" }}>
        <input
          type="email"
          className="search-bar"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "12px" }}
        />

        <input
          type="password"
          className="search-bar"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "12px" }}
        />

        <button className="btn-glow" style={{ width: "100%" }}>
          Login
        </button>
      </form>
    </main>
  );
    }
        
