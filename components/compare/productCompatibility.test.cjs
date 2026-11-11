const test = require("node:test");
const assert = require("node:assert/strict");
const { canCompare, inferType } = require("./productCompatibility.cjs");

function product(id, extra = {}) {
  return { id, categorySlug: "smartphones", productType: "smartphone", name: id, ...extra };
}

test("same explicit product type compares across category reorganizations", () => {
  assert.deepEqual(
    canCompare(product("A", { categorySlug: "mobile" }), product("B", { categorySlug: "electronics" })),
    { allowed: true, type: "smartphone" }
  );
});

test("different explicit product types are rejected even inside one broad category", () => {
  assert.equal(
    canCompare(product("A", { categorySlug: "audio", productType: "earbuds" }), product("B", { categorySlug: "audio", productType: "headphones" })).error,
    "TYPE_MISMATCH"
  );
});

test("new product types are accepted without editing an allowlist", () => {
  const a = product("A", { categorySlug: "home", productType: "robot-vacuum" });
  const b = product("B", { categorySlug: "cleaning", productType: "robot vacuum" });
  assert.equal(inferType(a), "robot-vacuum");
  assert.deepEqual(canCompare(a, b), { allowed: true, type: "robot-vacuum" });
});

test("products without explicit types are not comparable even in the same category", () => {
  const a = product("A", { categorySlug: "garden-tools", productType: undefined });
  const b = product("B", { categorySlug: "garden_tools", productType: undefined });
  assert.equal(canCompare(a, b).error, "PRODUCT_TYPE_REQUIRED");
});

test("different categories without explicit types are rejected", () => {
  const a = product("A", { categorySlug: "garden-tools", productType: undefined });
  const b = product("B", { categorySlug: "kitchen", productType: undefined });
  assert.equal(canCompare(a, b).error, "PRODUCT_TYPE_REQUIRED");
});

test("duplicate and incomplete product identities are rejected", () => {
  assert.equal(canCompare(product("A"), product("A")).error, "INVALID_PRODUCT");
  assert.equal(canCompare(product("A"), { categorySlug: "smartphones", productType: "smartphone" }).error, "INVALID_PRODUCT");
});

test("type aliases normalize consistently", () => {
  assert.deepEqual(
    canCompare(product("A", { productType: "smartphones" }), product("B", { productType: "smartphone" })),
    { allowed: true, type: "smartphone" }
  );
  assert.equal(inferType(product("C", { categorySlug: "power-banks", productType: undefined })), "power-bank");
});

test("broad category cannot make different declared product types comparable", () => {
  const shoes = product("Shoes", { categorySlug: "fashion", productType: "shoes" });
  const shirt = product("Shirt", { categorySlug: "fashion", productType: "t-shirt" });
  assert.equal(canCompare(shoes, shirt).error, "TYPE_MISMATCH");
});

test("explicit type is not weakened by missing type on the other product", () => {
  const shoes = product("Shoes", { categorySlug: "fashion", productType: "shoes" });
  const unknown = product("Unknown", { categorySlug: "fashion", productType: undefined });
  assert.equal(canCompare(shoes, unknown).error, "PRODUCT_TYPE_REQUIRED");
});

test("same explicit type remains comparable across different categories", () => {
  const a = product("A", { categorySlug: "fashion", productType: "shoes" });
  const b = product("B", { categorySlug: "footwear", productType: "shoes" });
  assert.deepEqual(canCompare(a, b), { allowed: true, type: "shoes" });
});

test("same broad category without product types is never enough", () => {
  const shoes = product("Shoes", { categorySlug: "fashion", productType: undefined });
  const jeans = product("Jeans", { categorySlug: "fashion", productType: undefined });
  assert.equal(canCompare(shoes, jeans).error, "PRODUCT_TYPE_REQUIRED");
});
