// lib/firebase-auth.js

let authInstance = null;

export async function getAuthClient() {
  if (typeof window === "undefined") return null; // prevent SSR break

  if (!authInstance) {
    const { getAuth } = await import("firebase/auth");
    const { default: app } = await import("./firebase-app");

    authInstance = getAuth(app);
  }

  return authInstance;
}
