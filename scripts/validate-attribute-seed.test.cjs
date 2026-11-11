const test = require("node:test");
const assert = require("node:assert/strict");
const { validateSeed } = require("./validate-attribute-seed.cjs");

const base = {
  schemaVersion: 1,
  collection: "attribute_definitions",
  definitions: [
    { key: "battery_life", label: "Battery life", aliases: ["runtime"], dataType: "measurement", unit: "hours", appliesTo: ["*"], comparable: true, filterable: false, active: true },
    { key: "colour", label: "Colour", aliases: ["color"], dataType: "enum", appliesTo: ["*"], comparable: true, filterable: true, active: true },
  ],
};

test("valid seed produces deterministic IDs without an existing database snapshot", () => {
  const result = validateSeed(base);
  assert.equal(result.ok, true);
  assert.deepEqual(result.actions.map((row) => row.id), ["battery_life", "colour"]);
  assert.ok(result.warnings.some((warning) => warning.includes("not checked")));
});

test("existing snapshot reports create and update without writing", () => {
  const result = validateSeed(base, new Map([["battery_life", { id: "battery_life" }]]));
  assert.deepEqual(result.actions.map((row) => row.action), ["update", "create"]);
});

test("duplicate keys and alias collisions are rejected", () => {
  const seed = structuredClone(base);
  seed.definitions[1].aliases = ["battery life"];
  seed.definitions.push({ ...seed.definitions[0] });
  const result = validateSeed(seed);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("Duplicate document key")));
  assert.ok(result.errors.some((error) => error.includes("Alias collides")));
});

test("measurement definitions require a unit", () => {
  const seed = structuredClone(base);
  delete seed.definitions[0].unit;
  const result = validateSeed(seed);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("measurement requires a unit")));
});
