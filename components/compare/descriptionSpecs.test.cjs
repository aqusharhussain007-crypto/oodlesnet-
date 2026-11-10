const test = require("node:test");
const assert = require("node:assert/strict");
const { extractDescriptionSpecs } = require("./descriptionSpecs.cjs");

test("extracts labelled facts from unstructured descriptions", () => {
  const rows = extractDescriptionSpecs("Bluetooth, Version 5.4 Battery Life: 48 Hours Fast Charging: Yes Noise Cancellation: Environmental Noise Cancellation");
  assert.deepEqual(rows, [
    { key: "battery_life", label: "Battery Life", value: "48 Hours" },
    { key: "fast_charging", label: "Fast Charging", value: "Yes" },
    { key: "noise_cancellation", label: "Noise Cancellation", value: "Environmental Noise Cancellation" },
  ]);
});

test("supports new category-independent labels and punctuation", () => {
  assert.deepEqual(
    extractDescriptionSpecs("Coverage Area: 500 sq ft; Filter Type: HEPA, CADR: 300 m³/h"),
    [
      { key: "coverage_area", label: "Coverage Area", value: "500 sq ft" },
      { key: "filter_type", label: "Filter Type", value: "HEPA" },
      { key: "cadr", label: "CADR", value: "300 m³/h" },
    ]
  );
});

test("does not invent facts from descriptions without explicit labels", () => {
  assert.deepEqual(extractDescriptionSpecs("Comfortable wireless earbuds with long battery life."), []);
});

test("ignores empty labels and safely handles missing descriptions", () => {
  assert.deepEqual(extractDescriptionSpecs("Battery Life:   Charging: USB-C"), [
    { key: "charging", label: "Charging", value: "USB-C" },
  ]);
  assert.deepEqual(extractDescriptionSpecs(null), []);
});
