# OodlesNet

OodlesNet is a mobile-first product discovery and price-comparison website built with Next.js, React, Firebase Firestore, and deployed on Vercel.

## Working procedure for future ChatGPT-assisted changes

When asked in any chat to add, edit, or remove live products or fix the site, first read this section and inspect the current repository state. Use the connected GitHub, Firebase-related application routes, and Vercel tools available in that session. Never assume a tool or credential is available until verified.

### Production safety rules

- Treat `main` as the production branch. Do not make speculative or unrelated changes.
- Prefer the smallest change that solves the request. Keep changes isolated and reviewable.
- For code changes, use a working branch and pull request where available; review the diff, merge only after checks/review, then verify the Vercel production deployment is `READY`.
- Do not delete branches that are `main`, contain unmerged work, or are still needed by an open pull request. Delete only clearly merged/obsolete branches after checking their PR/commit status.
- Never expose, copy into source control, or print API keys, Firebase service-account credentials, tokens, or other secrets. Do not put secret values in README, commits, logs, or chat.
- Preserve existing product IDs, product fields, and retailer offers unless the user explicitly asks to change them.
- Before deleting a product/category, check references and dependencies first. Prefer a reversible change when uncertain.
- Do not change Firebase project settings, Firestore rules, Vercel environment variables, billing, or production data structure without a clear need and explicit user approval for consequential changes.
- The user primarily works from an Android phone and prefers the assistant to carry out repository actions directly through connected tools, in short step-by-step updates. Prefer free-tier-compatible solutions and do not rely on GitHub Actions unless the user approves.

## Site and deployment

- GitHub repository: [aqusharhussain007-crypto/oodlesnet-](https://github.com/aqusharhussain007-crypto/oodlesnet-)
- Production branch: `main`
- Production site: https://www.oodlesnet.com/
- Vercel project: `oodlesnet`
- Firebase project ID used by the app: `oodlesnet-6c19e`
- Firestore location noted for this project: `asia-south1`
- Current app architecture noted by the project owner: Next.js 14 App Router, React 18, Firebase Firestore, Tailwind CSS. Always inspect `package.json` and the current code before making version-dependent changes.

## Firebase / Firestore connection

The app reads product and category data from Cloud Firestore using the Firebase configuration and client/server helpers already present in the repository. Before editing connection logic, inspect the current files (typically under `lib/`, `app/`, and `components/`) and the Vercel environment-variable names actually referenced by the code. Do not guess variable names or ask the user to paste secret values into chat.

Relevant collections used by the app have included:

- `products` — product documents, names, brands, category slugs, images, descriptions, tags/search fields, views/impressions, and store offers.
- `categories` — category documents with fields such as `slug`, `name`, `icon`, and `order`.
- `ads` — ad metadata and counters.
- `clicks` — click-tracking records.
- `rate_limits` — rate-limiting records.

The actual deployed schema may evolve; verify the current code and representative documents before writing. Existing security rules have generally allowed public reads for catalog data and restricted client writes. Do not weaken Firestore rules to make a task work.

### Product document shape

A common product document has fields similar to:

```js
{
  name: "Product name",
  brand: "Brand",
  categorySlug: "smartphones",
  description: "Product description",
  imageUrl: "/products/example.jpg",
  impressions: 0,
  views: 0,
  tags: ["tag-one", "tag-two"],
  store: [
    {
      name: "Store name",
      price: 12345,
      offer: "Offer details",
      url: "https://retailer.example/product"
    }
  ]
}
```

This is an illustrative schema, not a guarantee that every document contains every field. Check existing product documents and the current UI before adding or changing fields. Keep `store` as an array of offers; preserve correct retailer URLs and avoid inventing prices. Clearly distinguish verified/current prices from older observations.

## How to add, edit, or remove live products

1. Inspect the current product-management UI/API and Firestore access code. A production product writer/repair page or API route may exist; confirm it is present and understand its authentication/authorization before using it.
2. Confirm the intended document ID and whether a product already exists. Search by ID and name to avoid duplicates.
3. For a new product, provide accurate name, brand, category slug, image path/URL, description, and each known retailer offer. Validate image and retailer links where practical.
4. For edits, update only requested fields and preserve unrelated fields and all other store offers. Confirm whether the price applies to the same RAM/storage/colour/variant before replacing it.
5. For removal, confirm the exact product document first. Check whether any related records or links depend on it. Delete only the intended document after confirming the request.
6. Read the document back after the write and verify the expected fields. Then check the live product page/category where feasible.
7. Never use an unauthenticated admin route or expose admin credentials. If a safe authorized write path is unavailable, explain what access is missing rather than bypassing security.

## Categories and product listings

- Category display is affected by both Firestore category documents and the product `categorySlug` values, as well as homepage/category-page logic.
- Check the homepage, category drawer/menu, and `app/category/[slug]/page.js` when changing category names or slugs.
- Avoid leaving products under a slug with no visible category document.
- When consolidating legacy slugs, check for products under both old and new slugs, merge/deduplicate by document ID in display logic where appropriate, and preserve legacy routes when possible.
- The smartphone category was normalized in display/navigation to **Smartphones** while supporting legacy `smartphone` and plural `smartphones` product slugs. The code cleanup did not delete or rewrite product documents. Re-check current code before repeating this migration.

## Code change, review, merge, and deploy workflow

1. Read the relevant files on GitHub `main`; inspect the current production deployment first when the change affects live behavior.
2. Create a focused branch from current `main`.
3. Make the smallest required edit. Review the complete diff for unrelated changes, accidental secrets, broken imports, and unsafe production writes.
4. Open a pull request against `main`. Review changed files and any available checks. Do not merge if there are unresolved failures or the change could damage production data.
5. Merge the approved PR and record the merge commit SHA.
6. Check Vercel's latest production deployment and verify its Git commit matches the merged SHA. Wait for state `READY`; if it is `ERROR`, inspect the build logs and fix the cause before claiming success.
7. Fetch/check the production URL and relevant route(s). For category/product work, verify the actual page content and that old links still work where expected.
8. Report what changed, the commit/PR, deployment status, and any checks that could not be performed. Never claim a live change is complete before verification.

For small documentation-only updates, a direct commit to `main` may be acceptable if it cannot affect runtime behavior. For application code, prefer the branch/PR workflow above.

## Verification checklist

- [ ] The intended Firestore document was read back after a data write.
- [ ] No duplicate product was created.
- [ ] All unrelated retailer offers and product fields were preserved.
- [ ] Category menu, homepage section, and category route agree.
- [ ] The relevant live route returns a successful response and displays expected content.
- [ ] Vercel production deployment is `READY` and corresponds to the intended commit.
- [ ] No secrets or private credentials were added to source control.

## Resume instruction for a new ChatGPT chat

The user may say: **“Continue OodlesNet using the README procedure.”**

Then:
1. Open this README and inspect the current `main` branch and latest Vercel production deployment.
2. Use the connected tools available in that chat to perform the requested task; do not assume prior chat tool state or credentials carry over.
3. Follow the production safety and verification checklist above.
4. Keep replies concise and guide the user only when their input/approval is genuinely needed.
