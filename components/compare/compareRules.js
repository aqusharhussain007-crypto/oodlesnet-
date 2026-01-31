import {
  getLowestPrice,
  getStoreCount,
  hasOffers,
  getConfidenceScore,
} from "./compareUtils";

/* ---------------------------------
   TEMPORARY TYPE INFERENCE (NO DB)
   Uses name + searchKey
---------------------------------- */
const TYPE_MAP = {
  earbuds: ["earbuds", "tws", "in-ear", "in ear"],
  neckband: ["neckband"],
  bluetooth_speaker: ["speaker", "bluetooth speaker"],
  smartwatch: ["smartwatch", "watch"],
  headphones: ["headphone", "over-ear", "on-ear"],
};

function inferType(product) {
  const text = `${product.name || ""} ${product.searchKey || ""}`.toLowerCase();

  for (const [type, keywords] of Object.entries(TYPE_MAP)) {
    if (keywords.some((k) => text.includes(k))) {
      return type;
    }
  }

  return "unknown";
}

export function compareProducts(a, b) {
  /* --------------------
     HARD GUARDS
  -------------------- */

  // Must be same category
  if (a.categorySlug !== b.categorySlug) {
    return { error: "CATEGORY_MISMATCH" };
  }

  // Must be same inferred product kind
  const typeA = inferType(a);
  const typeB = inferType(b);

  if (typeA !== typeB || typeA === "unknown") {
    return { error: "TYPE_MISMATCH" };
  }

  /* --------------------
     SCORING
  -------------------- */

  const scoreA = {};
  const scoreB = {};

  // 1️⃣ Price (max 2)
  const priceA = getLowestPrice(a);
  const priceB = getLowestPrice(b);

  if (priceA && priceB) {
    const diff =
      Math.abs(priceA - priceB) / Math.min(priceA, priceB);

    if (diff >= 0.1) {
      priceA < priceB ? (scoreA.price = 2) : (scoreB.price = 2);
    } else if (diff >= 0.02) {
      priceA < priceB ? (scoreA.price = 1) : (scoreB.price = 1);
    }
  }

  // 2️⃣ Availability (max 1)
  const storesA = getStoreCount(a);
  const storesB = getStoreCount(b);

  if (storesA !== storesB) {
    storesA > storesB
      ? (scoreA.availability = 1)
      : (scoreB.availability = 1);
  }

  // 3️⃣ Offers (max 1)
  if (hasOffers(a) !== hasOffers(b)) {
    hasOffers(a)
      ? (scoreA.offers = 1)
      : (scoreB.offers = 1);
  }

  // 4️⃣ Confidence (max 1)
  const confA = getConfidenceScore(a);
  const confB = getConfidenceScore(b);

  if (confA !== confB) {
    confA > confB
      ? (scoreA.confidence = 1)
      : (scoreB.confidence = 1);
  }

  const totalA = Object.values(scoreA).reduce((s, v) => s + v, 0);
  const totalB = Object.values(scoreB).reduce((s, v) => s + v, 0);

  let winner = "tie";
  if (totalA !== totalB) {
    winner = totalA > totalB ? "A" : "B";
  }

  return {
    scores: { A: scoreA, B: scoreB },
    totals: { A: totalA, B: totalB },
    winner,
  };
                                }
      
