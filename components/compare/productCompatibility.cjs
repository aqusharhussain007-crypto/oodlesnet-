/**
 * Data-driven product compatibility.
 * Explicit product-type metadata is required. Broad category slugs are never
 * sufficient to establish product equivalence. New types need no code allowlist.
 */
function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const TYPE_ALIASES = {
  smartphones: "smartphone",
  "mobile-phones": "mobile-phone",
  "power-banks": "power-bank",
  "bluetooth-speakers": "bluetooth-speaker",
};

function canonicalType(product) {
  const explicit = product?.productType ?? product?.product_type ?? product?.type ?? product?.subcategory;
  const value = normalize(explicit);
  return value ? (TYPE_ALIASES[value] || value) : "";
}

function inferType(product) {
  const explicit = canonicalType(product);
  if (explicit) return explicit;
  const category = normalize(product?.categorySlug ?? product?.category_slug ?? product?.category);
  return category ? (TYPE_ALIASES[category] || category) : "unknown";
}

const RELATED_TYPE_GROUPS = {
  footwear: new Set(["shoe", "shoes", "sneaker", "sneakers", "running-shoe", "sports-shoe", "casual-shoe", "boot", "boots", "sandal", "sandals"]),
};

function relatedGroup(type) {
  for (const [group, types] of Object.entries(RELATED_TYPE_GROUPS)) {
    if (types.has(type)) return group;
  }
  return "";
}

function canCompare(a, b) {
  if (!a || !b || !a.id || !b.id || a.id === b.id) {
    return { allowed: false, error: "INVALID_PRODUCT" };
  }

  const typeA = canonicalType(a);
  const typeB = canonicalType(b);
  const categoryA = normalize(a.categorySlug ?? a.category_slug ?? a.category);
  const categoryB = normalize(b.categorySlug ?? b.category_slug ?? b.category);

  // Require an explicit product type on both products. Category is only
  // a navigation grouping (e.g. Fashion), never proof of comparability.
  if (!typeA || !typeB) {
    return { allowed: false, error: "PRODUCT_TYPE_REQUIRED" };
  }
  if (typeA === typeB) {
    return { allowed: true, type: typeA };
  }

  const groupA = relatedGroup(typeA);
  const groupB = relatedGroup(typeB);
  if (groupA && groupA === groupB) {
    return { allowed: true, type: groupA, match: "related" };
  }

  return { allowed: false, error: "TYPE_MISMATCH" };
}

module.exports = { canCompare, inferType, relatedGroup };
