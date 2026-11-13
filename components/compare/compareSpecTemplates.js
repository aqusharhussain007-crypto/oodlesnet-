/**
 * Comparison specification templates.
 *
 * Product records may optionally provide a `specs` object whose keys match
 * these field keys. Missing values remain null and are rendered as unavailable.
 * This file is configuration only; it does not migrate or write Firestore data.
 */

export const COMPARISON_SPEC_TEMPLATES = {
  smartphone: [
    { key: "display", label: "Display" },
    { key: "processor", label: "Processor" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "rearCamera", label: "Rear camera" },
    { key: "frontCamera", label: "Front camera" },
    { key: "battery", label: "Battery" },
    { key: "charging", label: "Charging" },
    { key: "operatingSystem", label: "Operating system" },
    { key: "network", label: "Network" },
  ],
  tablet: [
    { key: "display", label: "Display" },
    { key: "processor", label: "Processor" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "battery", label: "Battery" },
    { key: "operatingSystem", label: "Operating system" },
    { key: "connectivity", label: "Connectivity" },
  ],
  laptop: [
    { key: "display", label: "Display" },
    { key: "processor", label: "Processor" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
    { key: "graphics", label: "Graphics" },
    { key: "battery", label: "Battery" },
    { key: "weight", label: "Weight" },
    { key: "operatingSystem", label: "Operating system" },
  ],
  earbuds: [
    { key: "design", label: "Design" },
    { key: "driver", label: "Driver" },
    { key: "noiseCancellation", label: "Noise cancellation" },
    { key: "batteryLife", label: "Battery life" },
    { key: "charging", label: "Charging" },
    { key: "bluetooth", label: "Bluetooth" },
    { key: "waterResistance", label: "Water resistance" },
    { key: "microphone", label: "Microphone" },
  ],
  neckband: [
    { key: "design", label: "Design" },
    { key: "driver", label: "Driver" },
    { key: "batteryLife", label: "Battery life" },
    { key: "charging", label: "Charging" },
    { key: "bluetooth", label: "Bluetooth" },
    { key: "waterResistance", label: "Water resistance" },
    { key: "microphone", label: "Microphone" },
  ],
  headphones: [
    { key: "design", label: "Design" },
    { key: "driver", label: "Driver" },
    { key: "noiseCancellation", label: "Noise cancellation" },
    { key: "batteryLife", label: "Battery life" },
    { key: "bluetooth", label: "Bluetooth" },
    { key: "connectivity", label: "Connectivity" },
    { key: "microphone", label: "Microphone" },
  ],
  bluetooth_speaker: [
    { key: "outputPower", label: "Output power" },
    { key: "channels", label: "Audio channels" },
    { key: "batteryLife", label: "Battery life" },
    { key: "connectivity", label: "Connectivity" },
    { key: "waterResistance", label: "Water resistance" },
    { key: "dimensions", label: "Dimensions" },
    { key: "weight", label: "Weight" },
  ],
  smartwatch: [
    { key: "display", label: "Display" },
    { key: "healthSensors", label: "Health sensors" },
    { key: "gps", label: "GPS" },
    { key: "batteryLife", label: "Battery life" },
    { key: "waterResistance", label: "Water resistance" },
    { key: "compatibility", label: "Compatibility" },
  ],
  fitness_band: [
    { key: "display", label: "Display" },
    { key: "healthSensors", label: "Health sensors" },
    { key: "batteryLife", label: "Battery life" },
    { key: "waterResistance", label: "Water resistance" },
    { key: "compatibility", label: "Compatibility" },
  ],
  power_bank: [
    { key: "capacity", label: "Capacity" },
    { key: "outputPower", label: "Maximum output" },
    { key: "ports", label: "Ports" },
    { key: "input", label: "Input" },
    { key: "fastCharging", label: "Fast charging" },
    { key: "weight", label: "Weight" },
  ],
  ceiling_fan: [
    { key: "sweepSize", label: "Sweep size" },
    { key: "motorType", label: "Motor type" },
    { key: "powerConsumption", label: "Power consumption" },
    { key: "airDelivery", label: "Air delivery" },
    { key: "speed", label: "Speed" },
    { key: "warranty", label: "Warranty" },
  ],
  air_purifier: [
    { key: "coverageArea", label: "Coverage area" },
    { key: "filterType", label: "Filter type" },
    { key: "cadR", label: "CADR" },
    { key: "noiseLevel", label: "Noise level" },
    { key: "powerConsumption", label: "Power consumption" },
    { key: "sensors", label: "Sensors" },
  ],
  refrigerator: [
    { key: "capacity", label: "Capacity" },
    { key: "doorType", label: "Door type" },
    { key: "energyRating", label: "Energy rating" },
    { key: "coolingTechnology", label: "Cooling technology" },
    { key: "dimensions", label: "Dimensions" },
    { key: "warranty", label: "Warranty" },
  ],
  washing_machine: [
    { key: "capacity", label: "Capacity" },
    { key: "loadType", label: "Load type" },
    { key: "washTechnology", label: "Wash technology" },
    { key: "spinSpeed", label: "Spin speed" },
    { key: "energyRating", label: "Energy rating" },
    { key: "warranty", label: "Warranty" },
  ],
  cleanser: [
    { key: "skinType", label: "Suitable skin type" },
    { key: "volume", label: "Pack size" },
    { key: "keyIngredients", label: "Key ingredients" },
    { key: "formulation", label: "Formulation" },
    { key: "fragrance", label: "Fragrance" },
    { key: "usage", label: "Usage" },
  ],
  footwear: [
    { key: "material", label: "Material" },
    { key: "soleMaterial", label: "Sole material" },
    { key: "closure", label: "Closure" },
    { key: "shoeType", label: "Footwear type" },
    { key: "cushioning", label: "Cushioning" },
    { key: "waterResistance", label: "Water resistance" },
    { key: "weight", label: "Weight" },
  ],
  clothing: [
    { key: "material", label: "Material" },
    { key: "fabricComposition", label: "Fabric composition" },
    { key: "fit", label: "Fit" },
    { key: "fabricCare", label: "Care instructions" },
    { key: "occasion", label: "Occasion" },
  ],
  beauty: [
    { key: "keyIngredients", label: "Key ingredients" },
    { key: "skinType", label: "Suitable skin type" },
    { key: "formulation", label: "Formulation" },
    { key: "volume", label: "Pack size" },
    { key: "spf", label: "SPF" },
    { key: "benefits", label: "Benefits" },
  ],
  grocery: [
    { key: "netQuantity", label: "Net quantity" },
    { key: "ingredients", label: "Ingredients" },
    { key: "nutrition", label: "Nutrition" },
    { key: "shelfLife", label: "Shelf life" },
    { key: "dietaryType", label: "Dietary information" },
  ],
  furniture: [
    { key: "material", label: "Material" },
    { key: "dimensions", label: "Dimensions" },
    { key: "weightCapacity", label: "Weight capacity" },
    { key: "construction", label: "Construction" },
    { key: "warranty", label: "Warranty" },
  ],
  sports: [
    { key: "material", label: "Material" },
    { key: "dimensions", label: "Dimensions" },
    { key: "weight", label: "Weight" },
    { key: "intendedUse", label: "Intended use" },
    { key: "includedComponents", label: "Included components" },
  ],
  automotive: [
    { key: "compatibility", label: "Vehicle compatibility" },
    { key: "material", label: "Material" },
    { key: "dimensions", label: "Dimensions" },
    { key: "warranty", label: "Warranty" },
  ],
  books: [
    { key: "author", label: "Author" },
    { key: "publisher", label: "Publisher" },
    { key: "edition", label: "Edition" },
    { key: "language", label: "Language" },
    { key: "format", label: "Format" },
    { key: "pages", label: "Pages" },
  ],
  generic: [],
};

const PROFILE_BY_TYPE = {
  sneakers: "footwear",
  "running-shoes": "footwear",
  "sports-shoes": "footwear",
  "casual-shoes": "footwear",
  boots: "footwear",
  sandals: "footwear",
  shoes: "footwear",
  tshirt: "clothing",
  "t-shirt": "clothing",
  shirt: "clothing",
  jeans: "clothing",
  trousers: "clothing",
  dress: "clothing",
  cleanser: "beauty",
  facewash: "beauty",
  moisturizer: "beauty",
  serum: "beauty",
  sunscreen: "beauty",
  shampoo: "beauty",
  conditioner: "beauty",
};

export function getComparisonProfile(product) {
  const rawType = String(product?.productType ?? product?.product_type ?? product?.type ?? product?.subcategory ?? "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const profile = PROFILE_BY_TYPE[rawType] || rawType.replace(/-/g, "_");
  if (COMPARISON_SPEC_TEMPLATES[profile]) return profile;
  const category = String(product?.categorySlug ?? product?.category_slug ?? product?.category ?? "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const categoryProfiles = { fashion: "clothing", footwear: "footwear", beauty: "beauty", skincare: "beauty", groceries: "grocery", grocery: "grocery", furniture: "furniture", sports: "sports", automotive: "automotive", books: "books" };
  return categoryProfiles[category] || "generic";
}

const VARIANT_FIELDS = [
  { key: "modelNumber", label: "Model number" },
  { key: "variant", label: "Variant" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "capacity", label: "Capacity" },
];

function hasValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.some(hasValue);
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function displayableValue(value) {
  if (!hasValue(value)) return null;
  if (Array.isArray(value)) {
    const items = value.map(displayableValue).filter((item) => item !== null);
    return items.length ? items.join(", ") : null;
  }
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
  return value;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function specificationLabel(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

import descriptionSpecParser from "./descriptionSpecs.cjs";
const { extractDescriptionSpecs } = descriptionSpecParser;
import attributeRegistry from "./attributeRegistry.cjs";
const { buildAttributeIndex, resolveAttribute, normalizeAttributeValue } = attributeRegistry;

export function getComparisonSpecRows(product, definitions = []) {
  const registryIndex = buildAttributeIndex(definitions);
  const profile = getComparisonProfile(product);
  const profileFields = COMPARISON_SPEC_TEMPLATES[profile] || [];
  const templateIndex = new Map(profileFields.map((field, index) => [field.key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/-/g, "_").toLowerCase(), { ...field, index }]));
  const productType = String(product?.productType ?? product?.product_type ?? product?.type ?? product?.subcategory ?? "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const category = String(product?.categorySlug ?? product?.category_slug ?? product?.category ?? "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const appliesToProduct = (definition) => {
    if (definition?.comparable === false) return false;
    if (!Array.isArray(definition?.appliesTo) || !definition.appliesTo.length || definition.appliesTo.includes("*")) return true;
    const allowed = definition.appliesTo.map((item) => String(item).trim().toLowerCase().replace(/[_\s]+/g, "-"));
    return allowed.includes(productType) || allowed.includes(category) || allowed.includes(profile);
  };
  const sources = [
    product?.specs,
    product?.specifications,
    product?.attributes,
  ].filter(isPlainObject);

  const fields = new Map();
  for (const source of sources) {
    for (const [rawKey, rawValue] of Object.entries(source)) {
      const value = displayableValue(rawValue);
      if (value === null) continue;
      const definition = resolveAttribute(rawKey, registryIndex);
      if (!definition.key || ["size", "colour", "color"].includes(definition.key) || !appliesToProduct(definition)) continue;
      const normalizedValue = normalizeAttributeValue(rawValue, definition);
      fields.set(definition.key, {
        key: definition.key,
        label: definition.label || templateIndex.get(definition.key)?.label || specificationLabel(definition.key),
        value,
        normalizedValue,
        dataType: definition.dataType || "text",
        unit: definition.unit || null,
      });
    }
  }

  const description = displayableValue(product?.description);
  if (description !== null) {
    fields.set("product_details", {
      key: "product_details",
      label: "Product details (description)",
      value: description,
      source: "description",
    });
  }

  for (const item of extractDescriptionSpecs(product?.description, definitions)) {
    const definition = resolveAttribute(item.key, registryIndex);
    if (!fields.has(definition.key) && appliesToProduct(definition) && !["size", "colour", "color"].includes(definition.key)) {
      fields.set(definition.key, {
        ...item,
        key: definition.key,
        label: definition.label || templateIndex.get(definition.key)?.label || item.label,
        normalizedValue: normalizeAttributeValue(item.value, definition),
        dataType: definition.dataType || "text",
        unit: definition.unit || null,
      });
    }
  }

  return [...fields.values()].sort((a, b) => (templateIndex.get(a.key)?.index ?? 9999) - (templateIndex.get(b.key)?.index ?? 9999));
}

export function getProductVariant(product) {
  const explicit = product?.variantDetails;
  if (isPlainObject(explicit)) {
    const entries = Object.entries(explicit).filter(([, value]) => hasValue(value));
    if (entries.length) {
      const normalized = entries
        .filter(([key]) => !["colour", "color", "size"].includes(key.toLowerCase()))
        .map(([key, value]) => ({ key, label: key, value: displayableValue(value) }));
      return normalized.filter((item) => item.value !== null);
    }
  }

  const variants = VARIANT_FIELDS
    .filter((field) => hasValue(product?.[field.key]))
    .map((field) => ({
      ...field,
      value: displayableValue(product[field.key]),
    }));



  return variants;
}
