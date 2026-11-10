function getPriceAdvantagePoints(priceA, priceB) {
  if (
    !Number.isFinite(priceA) ||
    !Number.isFinite(priceB) ||
    priceA <= 0 ||
    priceB <= 0 ||
    priceA === priceB
  ) {
    return { product: null, points: 0, savingsPercent: 0 };
  }

  const lowerPrice = Math.min(priceA, priceB);
  const higherPrice = Math.max(priceA, priceB);
  const savingsPercent = (higherPrice - lowerPrice) / higherPrice;
  const product = priceA < priceB ? "A" : "B";

  if (savingsPercent >= 0.1) return { product, points: 2, savingsPercent };
  if (savingsPercent >= 0.02) return { product, points: 1, savingsPercent };
  return { product: null, points: 0, savingsPercent };
}

module.exports = { getPriceAdvantagePoints };
