"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase-auth";
import { onAuthStateChanged } from "firebase/auth";

export default function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return () => unsub();
  }, []);

  return user;
}
