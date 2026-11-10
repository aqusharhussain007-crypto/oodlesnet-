const test = require("node:test");
const assert = require("node:assert/strict");
const { getPriceAdvantagePoints } = require("./priceAdvantage.cjs");

test("price advantage uses the higher listed price as the savings denominator", () => {
  assert.equal(getPriceAdvantagePoints(98.01, 100).points, 0);
  assert.equal(getPriceAdvantagePoints(98, 100).points, 1);
  assert.equal(getPriceAdvantagePoints(90.01, 100).points, 1);
  assert.equal(getPriceAdvantagePoints(90, 100).points, 2);
  assert.equal(getPriceAdvantagePoints(100, 110).points, 1);
});

test("price advantage is assigned to the genuinely cheaper product", () => {
  assert.deepEqual(getPriceAdvantagePoints(120, 100), {
    product: "B",
    points: 2,
    savingsPercent: 1 / 6,
  });
});

test("equal, invalid, zero, negative, and missing prices earn no points", () => {
  for (const [a, b] of [[100, 100], [0, 100], [-1, 100], [null, 100], [100, Infinity], [NaN, 100]]) {
    assert.equal(getPriceAdvantagePoints(a, b).points, 0);
  }
});
