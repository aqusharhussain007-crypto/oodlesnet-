// lib/firebase-auth.js
import app from "./firebase-app";
import { getAuth } from "firebase/auth";

const auth = getAuth(app);

export { auth };
export default auth;

"use client";

import { useEffect, useState } from "react";

export default function useAuth() {
  
