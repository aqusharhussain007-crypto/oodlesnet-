import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const SALT = process.env.TRACKING_SALT || process.env.FIREBASE_PROJECT_ID || "oodlesnet";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|headless|facebookexternalhit|bingpreview|lighthouse|pingdom|uptime/i;

export function hashValue(value, length = 32) {
  return createHash("sha256").update(`${SALT}:${value}`).digest("hex").slice(0, length);
}

export function getClientKey(req) {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ua = req.headers.get("user-agent") || "";
  return hashValue(`${ip}|${ua}`);
}

export function isLikelyBot(req) {
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT_PATTERN.test(ua)) return true;
  const purpose = req.headers.get("sec-purpose") || req.headers.get("purpose");
  return /prefetch|prerender/i.test(purpose || "");
}

export function isSameOriginRequest(req) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let originHost;
  try { originHost = new URL(origin).host; } catch { return false; }
  const hosts = new Set();
  try { hosts.add(new URL(req.url).host); } catch {}
  const host = req.headers.get("host");
  if (host) hosts.add(host);
  const forwarded = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (forwarded) hosts.add(forwarded);
  return hosts.has(originHost);
}

export async function readJsonBody(req, maxBytes = 2048) {
  try {
    const text = await req.text();
    if (!text || text.length > maxBytes) return null;
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch { return null; }
}

export function isValidDocId(id) {
  return typeof id === "string" && id.length > 0 && id.length <= 200 &&
    !id.includes("/") && id !== "." && id !== ".." && !/^__.*__$/.test(id);
}

export function isValidStoreName(name) {
  return typeof name === "string" && /^[a-z0-9][a-z0-9 ._&-]{0,49}$/.test(name);
}

export function rateDocRef(id) {
  if (!adminDb) throw new Error("Tracking unavailable");
  return adminDb.collection("rate_limits").doc(id);
}

export function isRateLimited(snap, now, windowMs) {
  if (!snap.exists) return false;
  const last = Number(snap.data()?.lastMs || 0);
  return now - last < windowMs;
}

export function rateFields(now, windowMs) {
  return { lastMs: now, expireAt: Timestamp.fromMillis(now + windowMs + ONE_DAY_MS) };
}
