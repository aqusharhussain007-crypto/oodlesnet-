const test = require("node:test");
const assert = require("node:assert/strict");
const { getComparisonScore } = require("./comparisonScoring.cjs");

test("a 10% cheaper product wins with two price points", () => {
  const result = getComparisonScore(90, 100, false, false);
  assert.deepEqual(result.scores, { A: { price: 2 }, B: {} });
  assert.deepEqual(result.totals, { A: 2, B: 0 });
  assert.equal(result.winner, "A");
  assert.equal(result.maxScore, 3);
});

test("a 2% cheaper product wins when offer availability is equal", () => {
  const result = getComparisonScore(98, 100, true, true);
  assert.deepEqual(result.totals, { A: 1, B: 0 });
  assert.equal(result.winner, "A");
});

test("an offer advantage can balance a small price advantage", () => {
  const result = getComparisonScore(98, 100, false, true);
  assert.deepEqual(result.totals, { A: 1, B: 1 });
  assert.equal(result.winner, "tie");
});

test("a 10% price advantage remains ahead of a single offer point", () => {
  const result = getComparisonScore(90, 100, false, true);
  assert.deepEqual(result.totals, { A: 2, B: 1 });
  assert.equal(result.winner, "A");
});

test("an offer advantage decides the result when prices are equal", () => {
  const result = getComparisonScore(100, 100, true, false);
  assert.deepEqual(result.totals, { A: 1, B: 0 });
  assert.equal(result.winner, "A");
});

test("both products having offers does not award an arbitrary offer point", () => {
  const result = getComparisonScore(100, 100, true, true);
  assert.deepEqual(result.totals, { A: 0, B: 0 });
  assert.equal(result.winner, "tie");
});

test("missing price cannot create a price winner", () => {
  const result = getComparisonScore(null, 100, false, false);
  assert.deepEqual(result.totals, { A: 0, B: 0 });
  assert.equal(result.winner, "tie");
});

test("offer advantage can be shown when one or both prices are missing", () => {
  const result = getComparisonScore(null, 100, true, false);
  assert.deepEqual(result.totals, { A: 1, B: 0 });
  assert.equal(result.winner, "A");
});

test("A and B scoring is symmetric when product order is reversed", () => {
  const forward = getComparisonScore(90, 100, true, false);
  const reverse = getComparisonScore(100, 90, false, true);
  assert.deepEqual(forward.totals, { A: reverse.totals.B, B: reverse.totals.A });
  assert.equal(forward.winner, "A");
  assert.equal(reverse.winner, "B");
});
