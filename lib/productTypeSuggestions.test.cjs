const test = require("node:test");
const assert = require("node:assert/strict");
const suggestProductType = require("./productTypeSuggestions.cjs");

const cases = [
  ["Cetaphil Gentle Skin Cleanser", "beauty", "face-wash"],
  ["Swiss Beauty Liquid Concealer", "beauty", "concealer"],
  ["Plum Green Tea Alcohol-Free Toner", "beauty", "face-toner"],
  ["Redmi Buds 5C Bluetooth", "electronics", "wireless-earbuds"],
  ["Mamaearth Onion Hair Oil", "beauty", "hair-oil"],
  ["Pigeon 1300 Watt 1.5 Litre Electric Kettle", "appliances", "electric-kettle"],
  ["Lakmé 9 to 5 Primer + Matte Lipstick", "beauty", "lipstick"],
  ["Prestige PKGB 1.8 Litre Electric Glass Kettle", "appliances", "electric-kettle"],
  ["boAt Stone 350 Pro", "electronics", "speaker"],
  ["Puma Essentials Logo Hoodie", "fashion", "hoodie"],
  ["Maybelline Fit Me Matte + Poreless Foundation", "beauty", "foundation"],
  ["Boat 2025 Launch Rockerz 301 ANC", "electronics", "headphones"],
  ["Realme Buds T200", "electronics", "wireless-earbuds"],
  ["Havells Stealth Air BLDC 1200mm Ceiling Fan", "appliances", "ceiling-fan"],
  ["Redmi Note 14 Pro 5G", "smartphones", "smartphone"],
  ["Adidas Men Advantage Base Court Shoes", "fashion", "sneakers"],
  ["Unknown item with no clear type", "misc", ""],
];
for (const [name, categorySlug, expected] of cases) {
  test(name + " => " + (expected || "unassigned"), () => {
    assert.equal(suggestProductType({ name, categorySlug }), expected);
  });
}
