/**
 * Extract explicitly labelled "Field: value" facts from product descriptions.
 * This is intentionally category-agnostic and never guesses unlabeled facts.
 */
function extractDescriptionSpecs(description) {
  if (typeof description !== "string" || !description.trim()) return [];
  const text = description.replace(/\s+/g, " ").trim();
  const marker = /(?:^|[.;,]\s*|\s)([A-Za-z][A-Za-z0-9 /_-]{1,35}):\s*/g;
  const matches = [...text.matchAll(marker)];
  if (!matches.length) return [];

  const rows = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const label = match[1].trim().replace(/\s+/g, " ");
    const start = match.index + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const value = text.slice(start, end).replace(/^[\s,.;-]+|[\s,.;-]+$/g, "").trim();
    if (!value) continue;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (!key) continue;
    rows.push({ key, label, value });
  }
  return rows;
}

module.exports = { extractDescriptionSpecs };
