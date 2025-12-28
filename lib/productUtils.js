// lib/productUtils.js

/**
 * Sort store prices and return top 3 lowest prices
 * Safe for missing / invalid data
 */
export function getTopPrices(stores = []) {
  if (!Array.isArray(stores)) {
    return {
      lowest: null,
      second: null,
      third: null,
    };
  }

  const sorted = stores
    .filter((s) => s && typeof s.price === "number" && Number.isFinite(s.price))
    .sort((a, b) => a.price - b.price);

  return {
    lowest: sorted[0] || null,
    second: sorted[1] || null,
    third: sorted[2] || null,
  };
}

/**
 * Exclude a product by id from a list
 */
export function excludeProductById(products = [], excludeId) {
  if (!Array.isArray(products)) return [];
  return products.filter((p) => p && p.id !== excludeId);
}

/**
 * Filter products by price range (± percentage)
 * FULLY SAFE
 */
export function filterByPriceRange(products = [], basePrice, percent = 15) {
  if (!Array.isArray(products)) return [];
  if (typeof basePrice !== "number" || !Number.isFinite(basePrice)) return [];

  const min = basePrice - (basePrice * percent) / 100;
  const max = basePrice + (basePrice * percent) / 100;

  return products.filter((p) => {
    if (!Array.isArray(p.store)) return false;

    const prices = p.store
      .map((s) => Number(s.price))
      .filter((v) => Number.isFinite(v));

    if (!prices.length) return false;

    const lowest = Math.min(...prices);
    return lowest >= min && lowest <= max;
  });
           }
