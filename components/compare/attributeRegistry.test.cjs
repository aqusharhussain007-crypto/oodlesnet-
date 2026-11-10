const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeAttributeKey,
  buildAttributeIndex,
  resolveAttribute,
  normalizeAttributeValue,
} = require("./attributeRegistry.cjs");

test("normalizes different spellings into stable universal keys", () => {
  assert.equal(normalizeAttributeKey("Battery Life"), "battery_life");
  assert.equal(normalizeAttributeKey("battery-life"), "battery_life");
  assert.equal(normalizeAttributeKey("BluetoothVersion"), "bluetooth_version");
});

test("resolves registry aliases without category-specific code", () => {
  const index = buildAttributeIndex([
    { key: "battery_life", label: "Battery life", aliases: ["playback time", "runtime"], dataType: "measurement", unit: "hours" },
  ]);
  assert.equal(resolveAttribute("Playback Time", index).key, "battery_life");
  assert.equal(resolveAttribute("Battery life", index).label, "Battery life");
});

test("unknown attributes remain usable without editing the registry", () => {
  const field = resolveAttribute("Fabric composition", buildAttributeIndex([]));
  assert.equal(field.key, "fabric_composition");
  assert.equal(field.dataType, "text");
});

test("normalizes numeric measurements while preserving original source text", () => {
  const field = resolveAttribute("Battery life", buildAttributeIndex([
    { key: "battery_life", dataType: "measurement", unit: "hours" },
  ]));
  assert.deepEqual(normalizeAttributeValue("48 hours", field), {
    value: 48, unit: "hours", raw: "48 hours",
  });
});

test("keeps categorical values and lists intact", () => {
  assert.deepEqual(normalizeAttributeValue(["Cotton", "Polyester"]), ["Cotton", "Polyester"]);
  assert.equal(normalizeAttributeValue("Matte finish"), "Matte finish");
});
