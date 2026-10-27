# OodlesNet production product-writer plan

Status: design only; not approved for production implementation.

This plan does not authorize changes to `main`, production Vercel settings, production Firebase rules, or production credentials.

## Goal

Provide a controlled way to add verified products to the production Firestore `products` collection while preserving the current shopping flow and preventing accidental overwrites or test-data leakage.

## Proposed architecture

1. Keep the existing test writer separate. Do not merge its test-only route or its test credentials into production.
2. Implement a separate production writer route only after this plan is reviewed and explicitly approved.
3. Require server-side authentication and authorization for every write. A shared secret alone is not a complete long-term admin access design; prefer an authenticated administrator identity and server-side role check where the app's auth setup supports it.
4. Validate the full product schema on the server: `name`, `brand`, `categorySlug`, `description`, `imageUrl`, `tags`, and `store[]` with store name, positive numeric price, offer text, and HTTP(S) URL.
5. Use create-only writes for new products. If updating an existing product is ever needed, make it a separate explicit operation with its own authorization and audit trail; never silently overwrite.
6. Keep service-account credentials in server-only environment variables scoped to the production Vercel project. Never use `NEXT_PUBLIC_` for secrets, put keys in Git, return secrets in responses, or reuse test credentials.
7. Do not accept arbitrary Firebase project IDs from requests. Production code should use a fixed expected project ID and fail closed if the configured ID differs.
8. Record minimal audit metadata for successful writes (actor, document ID, timestamp, operation) without logging credentials or unnecessary personal data.
9. Start with manual, small batches and a dry-run/validation preview. Add automation only after a stable import format, duplicate policy, error reporting, and rollback/recovery procedure have been agreed.
10. Do not allow external product URLs to become open redirects. Validate store URLs and retain the existing redirect route's URL protocol checks.

## Required tests before release

- Valid product: validation succeeds and a new document is created once.
- Dry-run: no database writes occur.
- Missing/invalid authentication: rejected before any write.
- Invalid schema, invalid URL, or non-positive price: rejected.
- Duplicate document ID: rejected without modifying the existing document.
- Wrong Firebase project configuration: startup/request fails closed.
- Read-back: saved fields and store offers match the submitted normalized product.
- Audit: successful write is attributable without exposing credentials.
- Production smoke test: only after explicit approval, with a clearly labelled temporary record and a cleanup plan.

## Deployment and release gates

- Implement and test the writer on an isolated branch first.
- Review code diff, authentication approach, environment variables, and deployment target.
- Verify the test project and production project are distinct and that no test credentials are configured in production.
- Deploy preview and run all tests before requesting approval for any production merge.
- Do not merge, change production environment variables, alter Firestore rules, or deploy a production writer until the owner explicitly approves that specific step.

## Open decisions before implementation

- Which admin authentication mechanism is available in the production app (for example, Firebase Authentication with an admin allowlist)?
- Should the first production release support single-product entry only, or CSV/JSON batch import?
- What is the agreed source/provenance policy for product details and store prices, and how often will prices be refreshed?
- Who may add or update products, and how should corrections/deletions be audited?

## Current production context observed from repository

The production branch currently reads product data from the Firebase client SDK, and server-side Firebase Admin is used by tracking routes. The Firebase client config names project `oodlesnet-6c19e`. The new writer must be a separate, reviewed addition; existing tracking routes should not be repurposed as product-write endpoints.

## Isolated batch-writer prototype

A separate test-only batch prototype is being tested on `test/firestore-writer` at `/test-batch-writer` with API route `/api/test-batch-writer`.

- Accepts JSON arrays or CSV, up to 50 products and 500 KB per request.
- Validates all product records before attempting writes.
- Dry-run is the default; real writes require the test token and explicit confirmation.
- Uses create-only Firestore writes; duplicate IDs are reported without overwriting existing records.
- Hard-locked to `oodlesnet-test` and uses test-only environment variables.
- CSV requires `name`, `brand`, `categorySlug`, and `store`; the `store` field is a JSON array of offers. `tags` may also be a JSON array.
- Partial batch failures require review of per-record results before retrying; do not blindly retry.
- This prototype is not production-ready and must not be merged into `main`.
