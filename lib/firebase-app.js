// lib/firebase-app.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw",
  authDomain: "oodlesnet-6c19e.firebaseapp.com",
  projectId: "oodlesnet-6c19e",
  storageBucket: "oodlesnet-6c19e.appspot.com",
  messagingSenderId: "694946153614",
  appId: "1:694946153614:web:959d08d6a70078ab64b5df"
};

// Initialize app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// FORCE FIRESTORE TO USE ASIA-SOUTH1 REGION
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export default app; 
