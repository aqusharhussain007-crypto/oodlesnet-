"use client";

import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Import firebase auth ONLY on client
    async function init() {
      const { auth } = await import("@/lib/firebase-auth");
      const { onAuthStateChanged } = await import("firebase/auth");

      return onAuthStateChanged(auth, (u) => {
        setUser(u || null);
      });
    }

    const unsubPromise = init();

    return () => {
      unsubPromise.then((unsub) => unsub && unsub());
    };
  }, []);

  return user;
}
