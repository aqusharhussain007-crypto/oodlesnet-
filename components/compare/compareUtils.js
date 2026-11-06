import { getPriceConfidence } from "@/lib/priceConfidence";

export function getValidStoreOffers(productOrStores) {
  const stores = Array.isArray(productOrStores)
    ? productOrStores
    : Array.isArray(productOrStores?.store)
    ? productOrStores.store
    : [];

  return stores.filter((store) => {
    if (!store || typeof store !== "object") return false;
    const price = Number(store.price);
    return (
      typeof store.name === "string" &&
      store.name.trim().length > 0 &&
      Number.isFinite(price) &&
      price > 0
    );
  });
}

export function getLowestPrice(product) {
  const prices = getValidStoreOffers(product).map((store) => Number(store.price));
  return prices.length ? Math.min(...prices) : null;
}

export function getStoreCount(product) {
  const names = getValidStoreOffers(product).map((store) => store.name.trim().toLowerCase());
  return new Set(names).size;
}

export function hasOffers(product) {
  return getValidStoreOffers(product).some((store) => {
    if (typeof store.offer === "string") return store.offer.trim().length > 0;
    if (Array.isArray(store.offers)) return store.offers.some(Boolean);
    return Boolean(store.offers && typeof store.offers === "object" && Object.keys(store.offers).length);
  });
}

export function getConfidenceScore(product) {
  const confidence = getPriceConfidence(getValidStoreOffers(product));
  return confidence.label === "High" ? 3 : confidence.label === "Medium" ? 2 : 1;
}
