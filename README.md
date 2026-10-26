# OodlesNet

## Isolated Firestore writer test

This documentation applies to the `test/firestore-writer` branch and the separate Vercel project `oodlesnet-test-writer`. It is not a production deployment guide.

### Safety boundaries
- The API checks that `FIREBASE_PROJECT_ID` equals `oodlesnet-test` before initializing Firebase Admin.
- Test-only credentials belong only in the separate test Vercel project; never add them to the production `oodlesnet` project.
- The writer uses Firestore `create()`, so it cannot overwrite an existing document.
- A write requires bearer authentication and explicit `confirmWrite: true`; otherwise the API performs a dry-run.
- The verification action is read-only and returns the saved product fields, store offers, and timestamps.
- The test form's sample is clearly labelled test data. Do not use it for real listings.

### Test results recorded on 2026-10-26
| Check | Expected result | Result |
| --- | --- | --- |
| Read-back verification | HTTP 200; full saved record shown | Passed in user-provided screenshot |
| Duplicate protection | HTTP 409; existing document unchanged | Passed in user-provided screenshot |
| Invalid product data | HTTP 400 | Passed in user-provided screenshot |
| Incorrect bearer token | HTTP 401 | Passed in user-provided screenshot |
| Project isolation guard | API rejects any Firebase project ID other than `oodlesnet-test` | Confirmed by code inspection; no wrong-project runtime test performed |

### Manual test page
Open `/test-writer` on the test deployment. Enter the test token directly in the password field; do not paste it into chat or commit it to source control. Run each test separately. The wrong-token test intentionally uses a dummy token.

### Before any production integration
1. Review the test branch and deployment separately from production.
2. Decide how production credentials and authorization will be handled; never reuse the test service account or token.
3. Prepare a production integration plan and review it before making any change to `main`.
4. Do not merge this test-only writer into production without explicit approval and a separate security review.
