import { db } from "@/lib/firebase-app";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function addDefaultPrices() {
  const productsRef = collection(db, "products");
  const snap = await getDocs(productsRef);

  console.log(`Found ${snap.docs.length} products... Updating now.`);

  for (const d of snap.docs) {
    const productRef = doc(db, "products", d.id);

    await updateDoc(productRef, {
      amazonPrice: 0,
      amazonOffer: "No offer",
      amazonUrl: "",

      flipkartPrice: 0,
      flipkartOffer: "No offer",
      flipkartUrl: "",

      meeshoPrice: 0,
      meeshoOffer: "No offer",
      meeshoUrl: "",

      ajioPrice: 0,
      ajioOffer: "No offer",
      ajioUrl: "",
    });

    console.log(`Updated: ${d.id}`);
  }

  console.log("🎉 All products updated successfully!");
}
