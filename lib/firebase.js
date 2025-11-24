// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAGbs7GATXSzzWzPw_1Zf49ZDgG56mVpw",
  authDomain: "oodlesnet-6c19e.firebaseapp.com",
  projectId: "oodlesnet-6c19e",
  storageBucket: "oodlesnet-6c19e.firebasestorage.app",
  messagingSenderId: "694946153614",
  appId: "1:694946153614:web:959d08d6a70078ab64b5df"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
