import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import admin from "firebase-admin";

/* ---------------------------------------
   Firebase Admin – SAFE singleton init
---------------------------------------- */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

/* ---------------------------------------
   Rate limit config (5 seconds)
---------------------------------------- */
const RATE_LIMIT_SECONDS = 5;

/* ---------------------------------------
   GET handler
---------------------------------------- */
export async function GET(req, { params }) {
  const store = params.store;
  const { searchParams } = new URL(req.url);

  const pid = searchParams.get("pid");
  if (!pid || !store) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  /* ---------------------------------------
     1️⃣ Rate limiting (ADMIN ONLY)
  ---------------------------------------- */
  const rateKey = `${pid}_${store}`;
  const rateRef = db.collection("rate_limits").doc(rateKey);
  const rateSnap = await rateRef.get();

  const now = admin.firestore.Timestamp.now();

  if (rateSnap.exists) {
    const last = rateSnap.data().lastClick;
    if (last) {
      const diff =
        now.seconds - last.seconds;

      if (diff < RATE_LIMIT_SECONDS) {
        // Too fast → redirect without tracking
        redirect("/");
      }
    }
  }

  await rateRef.set(
    {
      productId: pid,
      store,
      lastClick: now,
    },
    { merge: true }
  );

  /* ---------------------------------------
     2️⃣ Click tracking (ADMIN ONLY)
  ---------------------------------------- */
  await db.collection("clicks").add({
    productId: pid,
    store,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  /* ---------------------------------------
     3️⃣ Resolve final store URL
  ---------------------------------------- */
  const productSnap = await db.collection("products").doc(pid).get();
  if (!productSnap.exists) {
    redirect("/");
  }

  const product = productSnap.data();
  const storeEntry = product.store?.find((s) => s.name === store);

  if (!storeEntry?.url) {
    redirect("/");
  }

  /* ---------------------------------------
     4️⃣ FINAL redirect (MUST BE LAST)
  ---------------------------------------- */
  redirect(storeEntry.url);
}
