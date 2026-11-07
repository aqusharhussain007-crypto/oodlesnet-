import {
  getLowestPrice,
  getStoreCount,
  hasOffers,
} from "./compareUtils";
import { getComparisonSpecRows, getProductVariant } from "./compareSpecTemplates";

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
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeType(value) {
  const normalized = normalizeCategory(value).replace(/-/g, "_");
  return TYPE_ALIASES[normalized] || normalized;
}

function inferType(product) {
  const explicit = product?.productType || product?.type || product?.subcategory;
  if (explicit) return normalizeType(explicit);

  const text = [
    product?.name,
    product?.searchKey,
    product?.brand,
    ...(Array.isArray(product?.tags) ? product.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) return type;
  }

  const category = normalizeCategory(product?.categorySlug);
  if (["power-banks", "bluetooth-speakers"].includes(category)) {
    return normalizeType(category);
  }

  return "unknown";
}

export function canCompare(a, b) {
  if (!a || !b || !a.id || !b.id || a.id === b.id) {
    return { allowed: false, error: "INVALID_PRODUCT" };
  }

  const categoryA = normalizeCategory(a.categorySlug);
  const categoryB = normalizeCategory(b.categorySlug);

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

  // Do not compare products unless both can be assigned a supported type.
  if (typeA === "unknown" || typeB === "unknown") {
    return { allowed: false, error: "UNSUPPORTED_TYPE" };
  }

  if (typeA !== typeB) {
    return { allowed: false, error: "TYPE_MISMATCH" };
  }

  return { allowed: true, type: typeA };
}

export function compareProducts(a, b) {
  const compatibility = canCompare(a, b);
  if (!compatibility.allowed) return { error: compatibility.error };

  const scoreA = {};
  const scoreB = {};

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

  // Retailer count is coverage information, not a product-quality score.
  if (hasOffers(a) !== hasOffers(b)) {
    hasOffers(a) ? (scoreA.offers = 1) : (scoreB.offers = 1);
  }

  const totalA = Object.values(scoreA).reduce((sum, value) => sum + value, 0);
  const totalB = Object.values(scoreB).reduce((sum, value) => sum + value, 0);

  let winner = "tie";
  if (totalA !== totalB) winner = totalA > totalB ? "A" : "B";

  return {
    compatibility,
    scores: { A: scoreA, B: scoreB },
    totals: { A: totalA, B: totalB },
    maxScore: 3,
    winner,
    priceComparison: { A: priceA, B: priceB },
    retailerCoverage: { A: getStoreCount(a), B: getStoreCount(b) },
    specifications: {
      A: getComparisonSpecRows(a, compatibility.type),
      B: getComparisonSpecRows(b, compatibility.type),
    },
    variants: { A: getProductVariant(a), B: getProductVariant(b) },
  };
}
