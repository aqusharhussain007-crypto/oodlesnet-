const test = require("node:test");
const assert = require("node:assert/strict");
const { canCompare, inferType } = require("./productCompatibility.cjs");

function product(id, extra = {}) {
  return { id, categorySlug: "smartphones", productType: "smartphone", name: id, ...extra };
}

test("smartphone singular and plural category slugs are compatible", () => {
  assert.deepEqual(
    canCompare(product("A", { categorySlug: "smartphone" }), product("B", { categorySlug: "smartphones" })),
    { allowed: true, type: "smartphone" }
  );
});

test("different categories are rejected before product-type matching", () => {
  assert.equal(canCompare(product("A"), product("B", { categorySlug: "laptops", productType: "laptop" })).error, "CATEGORY_MISMATCH");
});

test("different supported types within one broad category are rejected", () => {
  assert.equal(
    canCompare(product("A", { categorySlug: "audio", productType: "earbuds" }), product("B", { categorySlug: "audio", productType: "headphones" })).error,
    "TYPE_MISMATCH"
  );
});

test("unsupported explicit product types cannot compare even when labels match", () => {
  const a = product("A", { categorySlug: "electronics", productType: "unrecognized" });
  const b = product("B", { categorySlug: "electronics", productType: "unrecognized" });
  assert.equal(inferType(a), "unknown");
  assert.equal(canCompare(a, b).error, "UNSUPPORTED_TYPE");
});

test("duplicate and incomplete product identities are rejected", () => {
  assert.equal(canCompare(product("A"), product("A")).error, "INVALID_PRODUCT");
  assert.equal(canCompare(product("A"), { categorySlug: "smartphones", productType: "smartphone" }).error, "INVALID_PRODUCT");
});

test("known type aliases normalize to supported comparison types", () => {
  assert.equal(inferType(product("A", { productType: "smartphones" })), "smartphone");
  assert.equal(inferType(product("B", { categorySlug: "power-banks", productType: undefined })), "power_bank");
});
