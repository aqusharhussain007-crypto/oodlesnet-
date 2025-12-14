import { db } from "@/lib/firebase-app";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { redirect } from "next/navigation";

export default async function OutRedirect({ params, searchParams }) {
  const store = params.store;
  const pid = searchParams.pid || null;
  const url = searchParams.url;

  // Safety check
  if (!url) {
    redirect("/");
  }

  // Track click (fire & forget)
  try {
    await addDoc(collection(db, "clicks"), {
      store,
      productId: pid,
      url,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    // silent fail (never block redirect)
  }

  // Redirect user
  redirect(url);
}
