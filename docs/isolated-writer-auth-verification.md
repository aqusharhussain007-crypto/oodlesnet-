# Isolated product-writer authentication test

This route is only for the `test/firestore-writer` Preview deployment and is hard-locked to Firebase project `oodlesnet-test`.

It is not the production route and must never be merged into `main`. The production implementation remains in PR #6 and locked to `oodlesnet-6c19e`.

Verification sequence: confirm GET status; POST without a bearer token should return 401 before parsing; POST with a malformed Firebase ID token should return 401; then validate schema and dry-run only after a valid test-project Firebase ID token is available. Actual writes must use a unique test document ID and target only `oodlesnet-test`.
