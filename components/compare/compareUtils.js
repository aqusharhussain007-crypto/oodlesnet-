import { getPriceConfidence } from "@/lib/priceConfidence";

export function getLowestPrice(product) {
  const prices =
    product.store
      ?.map((s) => Number(s.price))
      .filter((p) => Number.isFinite(p) && p > 0) || [];
  return prices.length ? Math.min(...prices) : null;
}

export function getStoreCount(product) {
  return product.store?.length || 0;
}

export function hasOffers(product) {
  return product.store?.some((s) => s.offer || (Array.isArray(s.offers) && s.offers.length));
}

export function getConfidenceScore(product) {
  const c = getPriceConfidence(product.store || []);
  return c.label === "High" ? 3 : c.label === "Medium" ? 2 : 1;
                              }
                                                              
