import {
  getLowestPrice,
  getStoreCount,
  hasOffers,
} from "./compareUtils.js";
import { getComparisonSpecRows, getProductVariant } from "./compareSpecTemplates.js";

import productCompatibility from "./productCompatibility.cjs";
const { canCompare } = productCompatibility;
export { canCompare };

import priceAdvantage from "./priceAdvantage.cjs";
const { getPriceAdvantagePoints } = priceAdvantage;
export { getPriceAdvantagePoints };

export function compareProducts(a, b) {
  const compatibility = canCompare(a, b);
  if (!compatibility.allowed) return { error: compatibility.error };

  const scoreA = {};
  const scoreB = {};

  const priceA = getLowestPrice(a);
  const priceB = getLowestPrice(b);

  if (priceA !== null && priceB !== null) {
    const priceAdvantage = getPriceAdvantagePoints(priceA, priceB);
    if (priceAdvantage.points > 0) {
      const winningScore = priceAdvantage.product === "A" ? scoreA : scoreB;
      winningScore.price = priceAdvantage.points;
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
