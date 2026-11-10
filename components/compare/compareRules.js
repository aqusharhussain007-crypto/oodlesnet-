import {
  getLowestPrice,
  getStoreCount,
  hasOffers,
} from "./compareUtils.js";
import { getComparisonSpecRows, getProductVariant } from "./compareSpecTemplates.js";

import productCompatibility from "./productCompatibility.cjs";
const { canCompare } = productCompatibility;
export { canCompare };

import comparisonScoring from "./comparisonScoring.cjs";
const { getComparisonScore } = comparisonScoring;

export function compareProducts(a, b) {
  const compatibility = canCompare(a, b);
  if (!compatibility.allowed) return { error: compatibility.error };

  const priceA = getLowestPrice(a);
  const priceB = getLowestPrice(b);
  const scoring = getComparisonScore(priceA, priceB, hasOffers(a), hasOffers(b));

  return {
    compatibility,
    ...scoring,
    priceComparison: { A: priceA, B: priceB },
    retailerCoverage: { A: getStoreCount(a), B: getStoreCount(b) },
    specifications: {
      A: getComparisonSpecRows(a, compatibility.type),
      B: getComparisonSpecRows(b, compatibility.type),
    },
    variants: { A: getProductVariant(a), B: getProductVariant(b) },
  };
}
