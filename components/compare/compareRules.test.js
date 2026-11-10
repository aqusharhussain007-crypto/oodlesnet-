import test from "node:test";
import assert from "node:assert/strict";
import { canCompare, compareProducts, getPriceAdvantagePoints } from "./compareRules.js";
import { getLowestPrice, getStoreCount, getValidStoreOffers } from "./compareUtils.js";

function makeProduct(id, stores = [], extra = {}) {
  return {
    id,
    name: id,
    categorySlug: "smartphones",
    productType: "smartphone",
    store: stores,
    ...extra,
  };
}

function pricedProduct(id, price, offer = "") {
  return makeProduct(id, price == null ? [] : [{ name: "Amazon", price, offer }]);
}

test("price advantage uses the higher price as the savings denominator", () => {
  assert.equal(getPriceAdvantagePoints(98.01, 100).points, 0);
  assert.equal(getPriceAdvantagePoints(98, 100).points, 1);
  assert.equal(getPriceAdvantagePoints(90.01, 100).points, 1);
  assert.equal(getPriceAdvantagePoints(90, 100).points, 2);
  assert.equal(getPriceAdvantagePoints(100, 110).points, 1);
});

test("price advantage awards points to the genuinely cheaper product", () => {
  assert.deepEqual(getPriceAdvantagePoints(120, 100), {
    product: "B",
    points: 2,
    savingsPercent: 1 / 6,
  });
});

test("invalid, equal, zero, and missing prices award no price points", () => {
  for (const [a, b] of [[100, 100], [0, 100], [-1, 100], [null, 100], [100, Infinity], [NaN, 100]]) {
    assert.equal(getPriceAdvantagePoints(a, b).points, 0);
  }
});

test("comparison does not award a price advantage when either product lacks a valid price", () => {
  const result = compareProducts(pricedProduct("A", 100), pricedProduct("B", null));
  assert.deepEqual(result.totals, { A: 0, B: 0 });
  assert.equal(result.winner, "tie");
  assert.equal(result.priceComparison.B, null);
});

test("offer availability awards one point only to the product with a non-empty offer", () => {
  const onlyA = compareProducts(pricedProduct("A", 100, "10% off"), pricedProduct("B", 100));
  assert.deepEqual(onlyA.scores, { A: { offers: 1 }, B: {} });
  const both = compareProducts(pricedProduct("A", 100, "10% off"), pricedProduct("B", 100, "Bank offer"));
  assert.deepEqual(both.totals, { A: 0, B: 0 });
  const neither = compareProducts(pricedProduct("A", 100), pricedProduct("B", 100));
  assert.deepEqual(neither.totals, { A: 0, B: 0 });
});

test("price and offer points combine without exceeding the three-point scale", () => {
  const result = compareProducts(pricedProduct("A", 90, "10% off"), pricedProduct("B", 100));
  assert.deepEqual(result.totals, { A: 3, B: 0 });
  assert.equal(result.maxScore, 3);
  assert.equal(result.winner, "A");
});

test("smartphone singular and plural category slugs are compatible", () => {
  const a = makeProduct("A", [], { categorySlug: "smartphone" });
  const b = makeProduct("B", [], { categorySlug: "smartphones" });
  assert.equal(canCompare(a, b).allowed, true);
});

test("different categories, product types, unknown types, and duplicate products are rejected", () => {
  const phone = makeProduct("A");
  assert.equal(canCompare(phone, makeProduct("B", [], { categorySlug: "laptops", productType: "laptop" })).error, "CATEGORY_MISMATCH");
  assert.equal(canCompare(makeProduct("C", [], { categorySlug: "audio", productType: "earbuds" }), makeProduct("D", [], { categorySlug: "audio", productType: "headphones" })).error, "TYPE_MISMATCH");
  assert.equal(canCompare(makeProduct("E", [], { categorySlug: "electronics", productType: "unrecognized" }), makeProduct("F", [], { categorySlug: "electronics", productType: "unrecognized" })).error, "UNSUPPORTED_TYPE");
  assert.equal(canCompare(phone, phone).error, "INVALID_PRODUCT");
});

test("store validation ignores malformed offers and selects the lowest valid price", () => {
  const product = makeProduct("A", [
    { name: "Amazon", price: "1200" },
    { name: "Flipkart", price: 999 },
    { name: "Invalid", price: "not-a-price" },
    { name: "Zero", price: 0 },
    { name: "", price: 500 },
    null,
  ]);
  assert.equal(getValidStoreOffers(product).length, 2);
  assert.equal(getLowestPrice(product), 999);
});

test("retailer coverage counts unique named stores independently of valid prices", () => {
  const product = makeProduct("A", [
    { name: "Amazon" },
    { name: "amazon", price: "invalid" },
    { name: "Flipkart", price: 0 },
    { name: "   " },
  ]);
  assert.equal(getStoreCount(product), 2);
});

test("missing specification values remain missing rather than being inferred", () => {
  const result = compareProducts(
    makeProduct("A", [], { specs: { display: "6.7-inch AMOLED" } }),
    makeProduct("B")
  );
  const displayA = result.specifications.A.find((item) => item.key === "display");
  const displayB = result.specifications.B.find((item) => item.key === "display");
  assert.equal(displayA.value, "6.7-inch AMOLED");
  assert.equal(displayB.value, null);
});
