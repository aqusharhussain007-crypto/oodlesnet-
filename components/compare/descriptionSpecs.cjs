/**
 * Extract explicit labels and a conservative whitelist of footwear construction facts.
 * General marketing prose is never treated as a specification.
 */
const DEFAULT_LABELS = [
  "Battery Life", "Fast Charging", "Noise Cancellation", "Coverage Area",
  "Filter Type", "CADR", "Charging", "Bluetooth", "Version", "Capacity",
  "Material", "Fabric", "Colour", "Color", "Size", "Fit", "Skin Type",
  "Ingredients", "Volume", "SPF", "Fragrance", "Power Consumption",
  "Energy Rating", "Warranty", "Connectivity", "Water Resistance",
  "Sole Material", "Sole", "Closure", "Cushioning", "Footwear Type",
  "Shoe Type", "Upper Material", "Outsole Material", "Midsole Material",
  "Heel Type", "Arch Support", "Weight",
];
const FOOTWEAR_MATERIALS = [
  "synthetic leather", "genuine leather", "synthetic", "mesh", "leather",
  "textile", "knit", "canvas", "suede", "rubber", "EVA", "foam",
];
function escapeRegex(value) {
  return String(value).replace(/[.*+?^\${}()|[\]\\]/g, "\\$&");
}
function extractDescriptionSpecs(description, definitions = []) {
  if (typeof description !== "string" || !description.trim()) return [];
  const text = description.replace(/\s+/g, " ").trim();
  const labels = [...new Set([
    ...DEFAULT_LABELS,
    ...definitions.flatMap((item) => [item?.label, ...(Array.isArray(item?.aliases) ? item.aliases : [])]),
  ].filter((item) => typeof item === "string" && item.trim()))]
    .sort((a, b) => b.length - a.length);
  const alternatives = labels.map(escapeRegex).join("|");
  const marker = new RegExp("(?<![A-Za-z0-9])(" + alternatives + ")\\s*:\\s*", "gi");
  const matches = [...text.matchAll(marker)];
  const rows = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const label = match[1].trim();
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const value = text.slice(start, end).replace(/^[\s,.;|:-]+|[\s,.;|:-]+$/g, "").trim();
    if (!value) continue;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    rows.push({ key, label, value });
  }
  const materialPattern = FOOTWEAR_MATERIALS.sort((a, b) => b.length - a.length).map(escapeRegex).join("|");
  const upperMatch = text.match(/\\b((?:synthetic|mesh)(?:\\s+and\\s+(?:synthetic|mesh))|(?:synthetic leather|genuine leather|leather|textile|knit|canvas|suede|rubber|EVA|foam))\\s+upper\\b/i);
  if (upperMatch && !rows.some((row) => row.key === "material")) {
    rows.push({ key: "material", label: "Material", value: upperMatch[1] });
  }
  const outsoleMatch = text.match(new RegExp("\\b(" + materialPattern + ")\\s+outsole\\b", "i"));
  if (outsoleMatch && !rows.some((row) => row.key === "sole_material")) {
    rows.push({ key: "sole_material", label: "Sole Material", value: outsoleMatch[1] });
  }
  return rows;
}
module.exports = { extractDescriptionSpecs };
