const test = require("node:test");
const assert = require("node:assert/strict");

test("uses Firestore registry aliases and canonical labels for structured specs", async () => {
  const { getComparisonSpecRows } = await import("./compareSpecTemplates.js");
  const definitions = [
    { key: "battery_life", label: "Battery life", aliases: ["runtime"], dataType: "measurement", unit: "hours" },
    { key: "material", label: "Material", aliases: ["fabric composition"], dataType: "text" },
  ];
  const rows = getComparisonSpecRows({
    specs: { runtime: "48 hours", "fabric composition": "Cotton" },
  }, definitions);
  assert.equal(rows.find((row) => row.key === "battery_life").label, "Battery life");
  assert.deepEqual(rows.find((row) => row.key === "battery_life").normalizedValue, {
    value: 48, unit: "hours", raw: "48 hours",
  });
  assert.equal(rows.find((row) => row.key === "material").value, "Cotton");
});

test("uses registry aliases for explicitly labelled description facts", async () => {
  const { getComparisonSpecRows } = await import("./compareSpecTemplates.js");
  const definitions = [
    { key: "battery_life", label: "Battery life", aliases: ["runtime"], dataType: "measurement", unit: "hours" },
  ];
  const rows = getComparisonSpecRows({ description: "Runtime: 36 hours" }, definitions);
  const battery = rows.find((row) => row.key === "battery_life");
  assert.ok(battery);
  assert.equal(battery.label, "Battery life");
  assert.equal(battery.value, "36 hours");
});

test("keeps unknown attributes available without inventing values", async () => {
  const { getComparisonSpecRows } = await import("./compareSpecTemplates.js");
  const rows = getComparisonSpecRows({ specs: { "custom feature": "Verified value" } }, []);
  assert.equal(rows[0].key, "custom_feature");
  assert.equal(rows[0].value, "Verified value");
});

test("comparison profiles cover common categories and future types fall back safely", async () => {
  const { getComparisonProfile } = await import("./compareSpecTemplates.js");
  assert.equal(getComparisonProfile({ productType: "running shoes" }), "footwear");
  assert.equal(getComparisonProfile({ productType: "facewash" }), "beauty");
  assert.equal(getComparisonProfile({ categorySlug: "fashion" }), "clothing");
  assert.equal(getComparisonProfile({ productType: "robot-vacuum" }), "generic");
});

test("size and colour are excluded from comparison attributes and variants", async () => {
  const { getComparisonSpecRows, getProductVariant } = await import("./compareSpecTemplates.js");
  const product = {
    specs: { size: "UK 9", colour: "Black", material: "Mesh", cushioning: "Foam" },
    variantDetails: { size: "UK 9", colour: "Black", modelNumber: "X100" },
  };
  const specs = getComparisonSpecRows(product, []);
  const variants = getProductVariant(product);
  assert.deepEqual(specs.map((row) => row.key).sort(), ["cushioning", "material"]);
  assert.deepEqual(variants.map((row) => row.key), ["modelNumber"]);
});

test("excludes compound size and colour fields from specs and variants", async () => {
  const { getComparisonSpecRows, getProductVariant } = await import("./compareSpecTemplates.js");
  const product = {
    specs: { shoe_size: "UK 9", productColor: "Black", material: "Mesh" },
    variantDetails: { clothing_size: "M", colour_name: "Blue", modelNumber: "M2" },
  };
  assert.deepEqual(getComparisonSpecRows(product, []).map((row) => row.key), ["material"]);
  assert.deepEqual(getProductVariant(product).map((row) => row.key), ["modelNumber"]);
});
