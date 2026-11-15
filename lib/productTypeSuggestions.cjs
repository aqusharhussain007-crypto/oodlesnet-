function suggestProductType(product) {
  const name = String(product?.name || "").toLowerCase();
  const category = String(product?.categorySlug || "").toLowerCase();
  const rules = [
    [/\b(airpods|airdopes|earbuds|ear buds|buds t\d+|wireless earbuds|redmi buds)\b/, "wireless-earbuds"],
    [/\b(wireless headphones?|bluetooth headphones?|headphones?|headsets?|rockerz)\b/, "headphones"],
    [/\b(type.?c.*(converter|adapter)|audio adapter|3\.5mm converter)\b/, "audio-adapter"],
    [/\b(ceiling fan|pedestal fan|table fan|exhaust fan)\b/, "ceiling-fan"],
    [/\b(electric kettles?|kettle)\b/, "electric-kettle"],
    [/\b(running shoes|run shoes)\b/, "running-shoes"],
    [/\b(sneakers?|court shoes|casual shoes)\b/, "sneakers"],
    [/\b(hoodies?|sweatshirts?)\b/, "hoodie"],
    [/\b(jeans?|denim)\b/, "jeans"],
    [/\b(t.?shirts?|tees)\b/, "t-shirts"],
    [/\b(shirts?)\b/, "shirts"],
    [/\b(shoes?|footwear)\b/, "shoes"],
    [/\b(smart ?phones?|redmi note|iphone|galaxy s\d|motorola edge)\b/, "smartphone"],
    [/\b(smart ?watches?)\b/, "smartwatch"],
    [/\b(smart bands?|fitness bands?|mi smart band)\b/, "fitness-band"],
    [/\b(face wash|facial cleanser|skin cleanser|gentle skin cleanser)\b/, "face-wash"],
    [/\b(toners?|face toner)\b/, "face-toner"],
    [/\b(concealers?)\b/, "concealer"],
    [/\b(foundations?)\b/, "foundation"],
    [/\b(lipsticks?|matte lipstick)\b/, "lipstick"],
    [/\b(hair oils?|onion hair oil)\b/, "hair-oil"],
    [/\b(serum)\b/, "face-serum"],
    [/\b(moisturi[sz]er|face cream)\b/, "moisturizer"],
    [/\b(sunscreen|sun screen)\b/, "sunscreen"],
    [/\b(shampoo)\b/, "shampoo"],
    [/\b(power banks?)\b/, "power-bank"],
    [/\b(chargers?|charging adapter)\b/, "charger"],
    [/\b(cables?)\b/, "charging-cable"],
    [/\b(bluetooth speakers?|portable speakers?|stone \d+|speakers?)\b/, "speaker"],
    [/\b(laptops?|notebooks?)\b/, "laptop"],
    [/\b(tablets?|ipad)\b/, "tablet"],
    [/\b(televisions?|\btv\b)\b/, "television"],
    [/\b(washing machines?)\b/, "washing-machine"],
    [/\b(refrigerators?|fridges?)\b/, "refrigerator"],
    [/\b(mixers?|mixer grinders?)\b/, "mixer-grinder"],
    [/\b(vacuum cleaners?)\b/, "vacuum-cleaner"],
  ];
  for (const [pattern, type] of rules) if (pattern.test(name)) return type;
  if (category === "smartphones") return "smartphone";
  return "";
}
module.exports = suggestProductType;
