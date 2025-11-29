"use server";

import { auth } from "@/lib/firebase-auth";
import { signInWithEmailAndPassword } from "firebase/auth";

export async function loginAdmin(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Invalid email or password" };
  }
}
