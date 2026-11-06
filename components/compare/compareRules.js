import {
  getLowestPrice,
  getStoreCount,
  hasOffers,
  getConfidenceScore,
} from "./compareUtils";

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

function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");
}

function inferType(product) {
  const explicit = product?.productType || product?.type || product?.subcategory;
  if (explicit) return normalizeCategory(explicit).replace(/-/g, "_");

  const text = [product?.name, product?.searchKey, product?.brand, ...(Array.isArray(product?.tags) ? product.tags : [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) return type;
  }

  // A granular category slug can serve as a safe fallback type.
  const category = normalizeCategory(product?.categorySlug);
  if (["power-banks", "bluetooth-speakers"].includes(category)) {
    return category.replace(/-/g, "_").replace(/s$/, "");
  }

  return "unknown";
}

export function canCompare(a, b) {
  if (!a || !b || !a.id || !b.id || a.id === b.id) {
    return { allowed: false, error: "INVALID_PRODUCT" };
  }

  const categoryA = normalizeCategory(a.categorySlug);
  const categoryB = normalizeCategory(b.categorySlug);

  // Preserve known legacy category aliases without accepting unrelated categories.
  const categoryAliases = {
    smartphone: "smartphones",
    smartphones: "smartphones",
  };
  const canonicalA = categoryAliases[categoryA] || categoryA;
  const canonicalB = categoryAliases[categoryB] || categoryB;

  if (!canonicalA || canonicalA !== canonicalB) {
    return { allowed: false, error: "CATEGORY_MISMATCH" };
  }

  const typeA = inferType(a);
  const typeB = inferType(b);

  // If both types are known they must match. Unknown types remain selectable
  // within the same category until structured category specifications exist.
  if (typeA !== "unknown" && typeB !== "unknown" && typeA !== typeB) {
    return { allowed: false, error: "TYPE_MISMATCH" };
  }

  return { allowed: true, type: typeA === "unknown" ? typeB : typeA };
}

export function compareProducts(a, b) {
  const compatibility = canCompare(a, b);
  if (!compatibility.allowed) return { error: compatibility.error };

  const scoreA = {};
  const scoreB = {};

  // Price: a lower valid listed price earns up to two points.
  const priceA = getLowestPrice(a);
  const priceB = getLowestPrice(b);

  if (priceA !== null && priceB !== null) {
    const difference = Math.abs(priceA - priceB) / Math.min(priceA, priceB);
    if (difference >= 0.1) {
      priceA < priceB ? (scoreA.price = 2) : (scoreB.price = 2);
    } else if (difference >= 0.02) {
      priceA < priceB ? (scoreA.price = 1) : (scoreB.price = 1);
    }
  }

  // Retailer count is displayed as coverage, not treated as product quality.
  // The old availability point unfairly rewarded products with more listings.

  if (hasOffers(a) !== hasOffers(b)) {
    hasOffers(a) ? (scoreA.offers = 1) : (scoreB.offers = 1);
  }

  const confidenceA = getConfidenceScore(a);
  const confidenceB = getConfidenceScore(b);
  if (confidenceA !== confidenceB) {
    confidenceA > confidenceB
      ? (scoreA.confidence = 1)
      : (scoreB.confidence = 1);
  }

  const totalA = Object.values(scoreA).reduce((sum, value) => sum + value, 0);
  const totalB = Object.values(scoreB).reduce((sum, value) => sum + value, 0);

  let winner = "tie";
  if (totalA !== totalB) winner = totalA > totalB ? "A" : "B";

  return {
    compatibility,
    scores: { A: scoreA, B: scoreB },
    totals: { A: totalA, B: totalB },
    maxScore: 4,
    winner,
    priceComparison: { A: priceA, B: priceB },
    retailerCoverage: { A: getStoreCount(a), B: getStoreCount(b) },
  };
}
