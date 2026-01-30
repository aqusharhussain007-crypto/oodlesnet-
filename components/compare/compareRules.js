import {
  getLowestPrice,
  getStoreCount,
  hasOffers,
  getConfidenceScore,
} from "./compareUtils";

export function compareProducts(a, b) {
  // Gate: same category only
  if (a.categorySlug !== b.categorySlug) {
    return {
      error: "CATEGORY_MISMATCH",
    };
  }

  const scoreA = {};
  const scoreB = {};

  // 1) Price (max 2)
  const priceA = getLowestPrice(a);
  const priceB = getLowestPrice(b);

  if (priceA && priceB) {
    const diff = Math.abs(priceA - priceB) / Math.min(priceA, priceB);
    if (diff >= 0.1) {
      priceA < priceB ? (scoreA.price = 2) : (scoreB.price = 2);
    } else if (diff >= 0.02) {
      priceA < priceB ? (scoreA.price = 1) : (scoreB.price = 1);
    }
  }

  // 2) Availability (max 1)
  const storesA = getStoreCount(a);
  const storesB = getStoreCount(b);
  if (storesA !== storesB) {
    storesA > storesB ? (scoreA.availability = 1) : (scoreB.availability = 1);
  }

  // 3) Offers (max 1)
  if (hasOffers(a) !== hasOffers(b)) {
    hasOffers(a) ? (scoreA.offers = 1) : (scoreB.offers = 1);
  }

  // 4) Confidence (max 1)
  const confA = getConfidenceScore(a);
  const confB = getConfidenceScore(b);
  if (confA !== confB) {
    confA > confB ? (scoreA.confidence = 1) : (scoreB.confidence = 1);
  }

  const totalA = Object.values(scoreA).reduce((s, v) => s + v, 0);
  const totalB = Object.values(scoreB).reduce((s, v) => s + v, 0);

  let winner = "tie";
  if (totalA !== totalB) winner = totalA > totalB ? "A" : "B";

  return {
    scores: { A: scoreA, B: scoreB },
    totals: { A: totalA, B: totalB },
    winner,
  };
        }
    
