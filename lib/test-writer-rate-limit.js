import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const RATE_LIMIT_DOC = "test-writer-shared-token";

// Firestore transaction makes the limit shared across serverless instances.
// This is a conservative shared-token limit, not per-user identification.
export async function enforceTestWriterRateLimit(db) {
  const ref = db.collection("test_writer_rate_limits").doc(RATE_LIMIT_DOC);
  const now = Date.now();

  const result = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.exists ? snapshot.data() : {};
    const windowStartedAt = Number(data.windowStartedAt ?? 0);
    const requestCount = Number(data.requestCount ?? 0);
    const windowActive = now - windowStartedAt < WINDOW_MS && now >= windowStartedAt;

    if (windowActive && requestCount >= MAX_REQUESTS_PER_WINDOW) {
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((windowStartedAt + WINDOW_MS - now) / 1000)),
      };
    }

    const nextCount = windowActive ? requestCount + 1 : 1;
    transaction.set(ref, {
      windowStartedAt: windowActive ? windowStartedAt : now,
      requestCount: nextCount,
      updatedAt: FieldValue.serverTimestamp(),
      windowMs: WINDOW_MS,
      maxRequests: MAX_REQUESTS_PER_WINDOW,
    });
    return { allowed: true };
  });

  if (!result.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many authenticated test-writer requests. Wait before trying again.", retryAfterSeconds: result.retryAfter },
      { status: 429, headers: { "Retry-After": String(result.retryAfter), "Cache-Control": "no-store" } },
    );
  }
  return null;
}
