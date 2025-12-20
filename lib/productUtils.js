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
    .filter((s) => s && typeof s.price === "number")
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
  return products.filter((p) => p.id !== excludeId);
}

/**
 * Filter products by price range (± percentage)
 */
export function filterByPriceRange(products = [], basePrice, percent = 15) {
  if (!basePrice) return [];

  const min = basePrice - (basePrice * percent) / 100;
  const max = basePrice + (basePrice * percent) / 100;

  return products.filter((p) => {
    const prices = p.store?.map((s) => s.price) || [];
    const lowest = Math.min(...prices);
    return lowest >= min && lowest <= max;
  });
}
  
