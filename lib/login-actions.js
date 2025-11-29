// lib/login-actions.js
"use client";

import { auth } from "@/lib/firebase-auth";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

// This file MUST run on the CLIENT only.
// It simply wraps Firebase Auth functions safely.

export async function loginAdmin(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutAdmin() {
  return await signOut(auth);
}
