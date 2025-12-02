import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase-app";

export const getAds = async () => {
  try {
    const adsRef = collection(db, "ads");
    const snapshot = await getDocs(adsRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching ads:", error);
    return [];
  }
};
