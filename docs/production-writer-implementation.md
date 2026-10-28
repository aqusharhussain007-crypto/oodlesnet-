# Production product writer — release checklist

Status: isolated implementation branch; **not enabled or deployed to production**.

## Implemented endpoint

- `POST /api/admin/products` creates one product in the fixed production Firebase project `oodlesnet-6c19e`.
- `GET /api/admin/products` returns non-secret service status.
- Requires a Firebase ID token in the Authorization Bearer header and a server-side UID allowlist.
- Uses create-only Firestore writes; existing document IDs are not overwritten.
- Dry-run is the default. Actual creation requires `confirmWrite: true`.
- Validates product fields and HTTP(S) store URLs; request body capped at 50 KB.
- Writes an audit event to `product_writer_audit` after a successful product creation.
- Never accepts a project ID from the request and fails closed unless `FIREBASE_PROJECT_ID=oodlesnet-6c19e`.

## Required server-side environment

Configure only in the dedicated production app environment after the code has been reviewed and approved:

- `FIREBASE_PROJECT_ID`: exactly `oodlesnet-6c19e`
- `FIREBASE_CLIENT_EMAIL`: production service-account email
- `FIREBASE_PRIVATE_KEY`: production service-account private key, server-only
- `PRODUCTION_PRODUCT_WRITER_ADMIN_UIDS`: comma-separated Firebase Authentication UIDs approved to create products

Do not copy any test credentials or `TEST_WRITER_TOKEN` into this endpoint's configuration. Do not set these variables in the isolated test-writer project to test production writes.

## Before any production enablement

1. Confirm Firebase Authentication is enabled and identify the exact admin UID(s) from the trusted Firebase console.
2. Review the full diff and confirm no secrets or test credentials are committed.
3. Install/build with the repository's supported setup and verify the Next.js build passes.
4. Test in a dedicated non-production Firebase project first. Do not point this route at a test project; its fixed production project guard should fail closed there. For integration testing, use a separate test-only variant with an explicit test project lock.
5. Test unauthenticated (401), invalid token (401), non-allowlisted UID (403), missing allowlist (503), invalid product (400), dry-run (200 with no writes), successful create, duplicate ID (409), wrong project configuration (503), and audit failure behavior.
6. Review Firestore IAM/service-account permissions and restrict the production service account to the minimum required access.
7. Add a UI only after confirming the app's sign-in flow and admin account model; do not expose an unauthenticated public form.
8. Deploy a Preview build and verify it does not have production write credentials. Then request explicit approval before configuring production secrets or deploying/merging.

## Important behavior

Firestore product creation and audit logging are separate operations. If product creation succeeds but audit logging fails, the API reports `auditLogged: false` and warns not to retry blindly. A successful create is not rolled back by an audit failure.
