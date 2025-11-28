"use client";

import { auth } from "@/lib/firebase-auth";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function loginAdmin(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}
