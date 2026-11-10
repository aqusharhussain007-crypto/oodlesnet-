/**
 * Data-driven product compatibility.
 * Explicit product-type metadata is authoritative. If it is absent, products
 * can compare only when their normalized category slugs match.
 * No category or product-type allowlist is required for new catalogue entries.
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

function canCompare(a, b) {
  if (!a || !b || !a.id || !b.id || a.id === b.id) {
    return { allowed: false, error: "INVALID_PRODUCT" };
  }

  const typeA = canonicalType(a);
  const typeB = canonicalType(b);
  const categoryA = normalize(a.categorySlug ?? a.category_slug ?? a.category);
  const categoryB = normalize(b.categorySlug ?? b.category_slug ?? b.category);

  // When both records have explicit types, compare those types. This allows
  // taxonomy/category reorganizations without code changes.
  if (typeA && typeB) {
    if (typeA !== typeB) return { allowed: false, error: "TYPE_MISMATCH" };
    return { allowed: true, type: typeA };
  }

  // Without explicit type metadata, require the same known category.
  if (!categoryA || !categoryB) {
    return { allowed: false, error: "UNSUPPORTED_TYPE" };
  }
  if (categoryA !== categoryB) {
    return { allowed: false, error: "CATEGORY_MISMATCH" };
  }

  const inferred = TYPE_ALIASES[categoryA] || categoryA;
  return { allowed: true, type: inferred };
}

module.exports = { canCompare, inferType };
