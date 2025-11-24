// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw",
  authDomain: "oodlesnet-6c19e.firebaseapp.com",
  projectId: "oodlesnet-6c19e",
  storageBucket: "oodlesnet-6c19e.firebasestorage.app",
  messagingSenderId: "694946153614",
  appId: "1:694946153614:web:959d08d6a70078ab64b5df"
};

// Initialize Firebase (only once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Init Firestore
export const db = getFirestore(app);
