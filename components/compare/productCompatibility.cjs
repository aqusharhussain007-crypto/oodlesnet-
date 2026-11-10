const SUPPORTED_TYPES = new Set([
  "smartphone", "tablet", "laptop", "earbuds", "neckband",
  "headphones", "bluetooth_speaker", "smartwatch", "fitness_band",
  "power_bank", "ceiling_fan", "air_purifier", "refrigerator",
  "washing_machine", "cleanser",
]);

const TYPE_KEYWORDS = {
  earbuds: ["earbuds", "ear bud", "tws", "in-ear", "in ear"],
  neckband: ["neckband", "neck band"],
  bluetooth_speaker: ["bluetooth speaker", "portable speaker", "wireless speaker"],
  headphones: ["headphones", "headphone", "over-ear", "on-ear"],
  smartwatch: ["smartwatch", "smart watch"],
  fitness_band: ["fitness band", "smart band"],
  smartphone: ["smartphone", "mobile phone", "5g phone", "android phone", "iphone"],
  tablet: ["tablet", "ipad"],
  laptop: ["laptop", "notebook"],
  power_bank: ["power bank", "powerbank"],
  ceiling_fan: ["ceiling fan"],
  air_purifier: ["air purifier"],
  refrigerator: ["refrigerator", "fridge"],
  washing_machine: ["washing machine"],
  cleanser: ["cleanser", "face wash"],
};

const TYPE_ALIASES = {
  smartphones: "smartphone",
  power_banks: "power_bank",
  bluetooth_speakers: "bluetooth_speaker",
};

function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[_\\s]+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeType(value) {
  const normalized = normalizeCategory(value).replace(/-/g, "_");
  return TYPE_ALIASES[normalized] || normalized;
}

function inferType(product) {
  const explicit = product?.productType || product?.type || product?.subcategory;
  if (explicit) {
    const normalizedExplicit = normalizeType(explicit);
    return SUPPORTED_TYPES.has(normalizedExplicit) ? normalizedExplicit : "unknown";
  }

  const text = [
    product?.name,
    product?.searchKey,
    product?.brand,
    ...(Array.isArray(product?.tags) ? product.tags : []),
  ].filter(Boolean).join(" ").toLowerCase();

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) return type;
  }

  const category = normalizeCategory(product?.categorySlug);
  if (["smartphone", "smartphones"].includes(category)) return "smartphone";
  if (["power-banks", "bluetooth-speakers"].includes(category)) return normalizeType(category);
  return "unknown";
}

function canCompare(a, b) {
  if (!a || !b || !a.id || !b.id || a.id === b.id) {
    return { allowed: false, error: "INVALID_PRODUCT" };
  }

  const categoryA = normalizeCategory(a.categorySlug);
  const categoryB = normalizeCategory(b.categorySlug);
  const categoryAliases = { smartphone: "smartphones", smartphones: "smartphones" };
  const canonicalA = categoryAliases[categoryA] || categoryA;
  const canonicalB = categoryAliases[categoryB] || categoryB;

  if (!canonicalA || canonicalA !== canonicalB) {
    return { allowed: false, error: "CATEGORY_MISMATCH" };
  }

  const typeA = inferType(a);
  const typeB = inferType(b);
  if (typeA === "unknown" || typeB === "unknown") {
    return { allowed: false, error: "UNSUPPORTED_TYPE" };
  }
  if (typeA !== typeB) {
    return { allowed: false, error: "TYPE_MISMATCH" };
  }
  return { allowed: true, type: typeA };
}

module.exports = { canCompare, inferType };
