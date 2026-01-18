export function getPriceConfidence(store = []) {
  const prices = store
    .map(s => Number(s.price))
    .filter(p => Number.isFinite(p));

  if (prices.length === 0) {
    return {
      score: 0,
      label: "Low",
      title: "Wait or watch this product",
      message: "Not enough pricing data to judge buying confidence.",
    };
  }

  const storeCount = prices.length;
  const expectedStoreCount = 5;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const spread = (max - min) / min;

  /* 1️⃣ Market coverage */
  const coverageRatio = storeCount / expectedStoreCount;
  let coverageScore = 8;
  if (coverageRatio > 0.6) coverageScore = 35;
  else if (coverageRatio > 0.4) coverageScore = 25;
  else if (coverageRatio > 0.2) coverageScore = 15;

  /* 2️⃣ Price spread health */
  let spreadScore = 8;
  if (spread < 0.08) spreadScore = 35;
  else if (spread < 0.18) spreadScore = 28;
  else if (spread < 0.3) spreadScore = 18;

  /* 3️⃣ Price structure integrity */
  const roundedPrices = prices.filter(
    p => p % 100 === 0 || p % 100 === 99
  ).length;
  const integrityRatio = roundedPrices / prices.length;

  let integrityScore = 6;
  if (integrityRatio > 0.8) integrityScore = 20;
  else if (integrityRatio > 0.5) integrityScore = 12;

  /* 4️⃣ Buyer friction penalty */
  let frictionPenalty = 0;
  if (storeCount === 1) frictionPenalty += 5;
  if (spread > 0.3) frictionPenalty += 3;

  const score = Math.max(
    0,
    Math.min(
      100,
      coverageScore + spreadScore + integrityScore - frictionPenalty
    )
  );

  let label = "Low";
  let title = "Wait or watch this product";
  let message =
    "Large price differences suggest frequent changes or temporary offers.";

  if (score >= 75) {
    label = "High";
    title = "Good time to buy";
    message =
      "Prices are consistent across multiple trusted stores, indicating a stable market.";
  } else if (score >= 45) {
    label = "Medium";
    title = "Compare before buying";
    message =
      "Prices vary slightly between sellers. Careful comparison may help you save more.";
  }

  return { score, label, title, message };
}
