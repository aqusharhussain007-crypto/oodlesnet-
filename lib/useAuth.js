"use client";

import { useEffect, useState } from "react";
import { getAuthClient } from "@/lib/firebase-auth";

export default function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    async function start() {
      const auth = await getAuthClient();
      if (!auth) {
        setUser(null);
        return;
      }

      const { onAuthStateChanged } = await import("firebase/auth");

      return onAuthStateChanged(auth, (u) => setUser(u || null));
    }

    let unsubscribePromise = start();

    return () => {
      unsubscribePromise.then((unsub) => unsub && unsub());
    };
  }, []);

  return user;
}
