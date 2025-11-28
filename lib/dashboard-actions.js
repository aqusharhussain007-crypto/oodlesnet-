"use client";

import { db } from "@/lib/firebase-app";
import { doc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { auth } from "@/lib/firebase-auth";
import { signOut } from "firebase/auth";

export async function loadAllProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

export async function logoutAdmin() {
  await signOut(auth);
    }
