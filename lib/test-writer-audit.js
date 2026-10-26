import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

// Minimal metadata only. Never pass product payloads, tokens, or credentials here.
export async function writeTestWriterAudit(db, event) {
  const eventId = randomUUID();
  await db.collection("test_writer_audit").doc(eventId).create({
    eventId,
    targetProject: "oodlesnet-test",
    timestamp: FieldValue.serverTimestamp(),
    operation: event.operation,
    batchId: event.batchId ?? eventId,
    actor: "test-writer-token",
    requested: event.requested,
    created: event.created,
    duplicates: event.duplicates ?? 0,
    failed: event.failed ?? 0,
    outcome: event.outcome,
  });
  return eventId;
}
