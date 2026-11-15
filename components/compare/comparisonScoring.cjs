const { getPriceAdvantagePoints } = require("./priceAdvantage.cjs");

function getComparisonScore(priceA, priceB, hasOfferA, hasOfferB) {
  const scoreA = {};
  const scoreB = {};

  const priceAdvantage = getPriceAdvantagePoints(priceA, priceB);
  if (priceAdvantage.points > 0) {
    const winningScore = priceAdvantage.product === "A" ? scoreA : scoreB;
    winningScore.price = priceAdvantage.points;
  }

  if (Boolean(hasOfferA) !== Boolean(hasOfferB)) {
    Boolean(hasOfferA) ? (scoreA.offers = 1) : (scoreB.offers = 1);
  }

  const totalA = Object.values(scoreA).reduce((sum, value) => sum + value, 0);
  const totalB = Object.values(scoreB).reduce((sum, value) => sum + value, 0);
  const winner = totalA === totalB ? "tie" : totalA > totalB ? "A" : "B";

  return {
    scores: { A: scoreA, B: scoreB },
    totals: { A: totalA, B: totalB },
    maxScore: 3,
    winner,
  };
}

module.exports = { getComparisonScore };
