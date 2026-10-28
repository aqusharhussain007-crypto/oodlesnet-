# OodlesNet — isolated product import testing

This branch is for review/testing only. It must not be merged into production until its parser and endpoint checks pass on the isolated test deployment.

## CSV / JSON bulk importer

- Page: `/test-bulk-import`
- API: `POST /api/admin/products/batch`
- Parser and shared validation: `lib/product-import.mjs`
- Unit tests: `tests/product-import.test.mjs`
- Example templates: `data/products.example.csv` and `data/products.example.json`

### Supported formats

JSON may be either an array of product objects or an object containing a `products` array. CSV columns are:

`documentId,name,brand,categorySlug,description,imageUrl,tags,store`

- `documentId` is required and must be stable for each product.
- `tags` may be pipe-separated (for example `phone|5g`) or a JSON string array.
- `store` must contain a JSON array of offers, each with `name`, positive numeric `price`, HTTP(S) `url`, and optional `offer`.
- A maximum of 100 products is accepted per file.
- The example templates contain placeholder data only and must not be imported as real listings.

### Safety rules

- The bulk endpoint is hard-locked to Firebase project ID `oodlesnet-test`; it must not accept a project ID from the request.
- Uses verified Firebase ID tokens and a server-side `TEST_WRITER_ADMIN_UIDS` allowlist.
- Dry-run is the default. Actual writes require `confirmWrite: true` plus the explicit checkbox on the test page.
- Invalid rows and duplicate IDs / duplicate name-brand-category combinations inside a file reject the entire file before any writes.
- Existing document IDs and matching existing name/brand/category records are skipped; writes use Firestore `create()`, never overwrite.
- A bulk request may partially complete if a later Firestore operation fails. Review each row result and check Firestore before retrying. Never blindly repeat a request after a network error.
- Audit logging is best-effort and reported per created record; an audit failure does not undo a product write.
- Test-only credentials must remain in the separate test Vercel project. Never copy test credentials to production or commit secrets.

## Previously recorded single-writer tests

The following checks were recorded on 2026-10-26 from user-provided screenshots for the older `/api/test-writer` endpoint. These are **not evidence that the new CSV/JSON parser or bulk endpoint has passed runtime tests**.

| Check | Recorded result |
| --- | --- |
| Read-back verification | Passed |
| Duplicate protection | Passed; HTTP 409, no overwrite |
| Invalid product data | Passed; HTTP 400 |
| Incorrect bearer token | Passed; HTTP 401 |
| Project isolation guard | Code inspection only; no wrong-project runtime test |

## Required checks before considering this branch validated

1. Run `node --test tests/product-import.test.mjs` and resolve all failures.
2. On the isolated test deployment only, verify unauthenticated request (401), invalid token (401), non-allowlisted UID (403), missing allowlist (503), malformed body / invalid product (400), dry-run with no writes, successful test create, duplicate ID skip (without overwrite), duplicate name skip, and project mismatch fail-closed.
3. Verify mixed batches report per-row results and that an uncertain network response does not encourage blind retries.
4. Read back created test documents and verify all fields and store offers.
5. Confirm test credentials are scoped only to the isolated test project.

Do not merge this branch to `main`, configure production credentials, or write to production until the isolated tests are reviewed and the user explicitly approves the production integration.
