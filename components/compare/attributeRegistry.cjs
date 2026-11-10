/**
 * Universal, category-agnostic product attribute registry helpers.
 * Registry definitions are data, not code branches. A future Firestore
 * attribute_definitions collection can supply these records at runtime.
 */
function normalizeAttributeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildAttributeIndex(definitions = []) {
  const index = new Map();
  for (const definition of definitions) {
    if (!definition || typeof definition !== "object") continue;
    const canonicalKey = normalizeAttributeKey(definition.key || definition.id);
    if (!canonicalKey) continue;
    const record = {
      ...definition,
      key: canonicalKey,
      label: String(definition.label || definition.name || canonicalKey.replace(/_/g, " ")),
      aliases: Array.isArray(definition.aliases) ? definition.aliases : [],
    };
    index.set(canonicalKey, record);
    for (const alias of record.aliases) {
      const aliasKey = normalizeAttributeKey(alias);
      if (aliasKey && !index.has(aliasKey)) index.set(aliasKey, record);
    }
  }
  return index;
}

function resolveAttribute(rawKey, index) {
  const normalizedKey = normalizeAttributeKey(rawKey);
  const definition = index instanceof Map ? index.get(normalizedKey) : null;
  return definition || {
    key: normalizedKey,
    label: String(rawKey || normalizedKey).replace(/[_-]+/g, " ").replace(/\\b\\w/g, (letter) => letter.toUpperCase()),
    dataType: "text",
    comparison: "exact",
    source: "product",
  };
}

function normalizeAttributeValue(value, definition = {}) {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) {
    const values = value.map((item) => normalizeAttributeValue(item, definition)).filter((item) => item !== null);
    return values.length ? values : null;
  }
  if (definition.dataType === "number" || definition.dataType === "measurement") {
    const number = typeof value === "number" ? value : Number(String(value).match(/-?\\d+(?:\\.\\d+)?/)?.[0]);
    if (!Number.isFinite(number)) return String(value).trim();
    return { value: number, unit: definition.unit || null, raw: String(value) };
  }
  if (typeof value === "string") return value.trim() || null;
  return value;
}

module.exports = {
  normalizeAttributeKey,
  buildAttributeIndex,
  resolveAttribute,
  normalizeAttributeValue,
};
