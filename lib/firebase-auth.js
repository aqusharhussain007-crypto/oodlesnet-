"use client";

import app from "./firebase-app";
import { getAuth } from "firebase/auth";

export const auth = getAuth(app);
