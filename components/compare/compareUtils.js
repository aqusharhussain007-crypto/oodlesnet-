import { getPriceConfidence } from "../../lib/priceConfidence";

function isNonEmptyOffer(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  if (Array.isArray(value)) return value.some(isNonEmptyOffer);
  if (value && typeof value === "object") {
    return Object.values(value).some(isNonEmptyOffer);
  }
  return false;
}

export function getValidStoreOffers(productOrStores) {
  const stores = Array.isArray(productOrStores)
    ? productOrStores
    : Array.isArray(productOrStores?.store)
    ? productOrStores.store
    : [];

  return stores.filter((store) => {
    if (!store || typeof store !== "object" || Array.isArray(store)) return false;

    const rawPrice = store.price;
    const validPriceType =
      typeof rawPrice === "number" ||
      (typeof rawPrice === "string" && rawPrice.trim() !== "");
    if (!validPriceType) return false;

    const price = Number(rawPrice);
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
  const stores = Array.isArray(product)
    ? product
    : Array.isArray(product?.store)
    ? product.store
    : [];

  // Coverage counts named retailer entries even when their price is missing.
  const names = stores
    .filter(
      (store) =>
        store &&
        typeof store === "object" &&
        !Array.isArray(store) &&
        typeof store.name === "string" &&
        store.name.trim().length > 0
    )
    .map((store) => store.name.trim().toLowerCase());

  return new Set(names).size;
}

export function hasOffers(product) {
  return getValidStoreOffers(product).some(
    (store) => isNonEmptyOffer(store.offer) || isNonEmptyOffer(store.offers)
  );
}

export function getConfidenceScore(product) {
  const confidence = getPriceConfidence(getValidStoreOffers(product));
  return confidence.label === "High" ? 3 : confidence.label === "Medium" ? 2 : 1;
}
