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
};

const VARIANT_FIELDS = [
  { key: "modelNumber", label: "Model number" },
  { key: "variant", label: "Variant" },
  { key: "ram", label: "RAM" },
  { key: "storage", label: "Storage" },
  { key: "capacity", label: "Capacity" },
  { key: "size", label: "Size" },
];

function hasValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.some(hasValue);
  return true;
}

function displayableValue(value) {
  if (!hasValue(value)) return null;
  if (Array.isArray(value)) {
    const items = value.map(displayableValue).filter(Boolean);
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

export function getComparisonSpecRows(product, productType) {
  const template = COMPARISON_SPEC_TEMPLATES[productType] || [];
  const specs = isPlainObject(product?.specs) ? product.specs : {};

  return template.map((field) => ({
    ...field,
    value: displayableValue(specs[field.key]),
  }));
}

export function getProductVariant(product) {
  const explicit = product?.variantDetails;
  if (isPlainObject(explicit)) {
    const entries = Object.entries(explicit).filter(([, value]) => hasValue(value));
    if (entries.length) {
      const colourEntry =
        entries.find(([key]) => key.toLowerCase() === "colour") ||
        entries.find(([key]) => key.toLowerCase() === "color");
      const otherEntries = entries.filter(
        ([key]) => !["colour", "color"].includes(key.toLowerCase())
      );
      const normalized = [
        ...otherEntries.map(([key, value]) => ({ key, label: key, value: displayableValue(value) })),
        ...(colourEntry
          ? [{ key: "colour", label: "Colour", value: displayableValue(colourEntry[1]) }]
          : []),
      ];
      return normalized.filter((item) => item.value !== null);
    }
  }

  const variants = VARIANT_FIELDS
    .filter((field) => hasValue(product?.[field.key]))
    .map((field) => ({
      ...field,
      value: displayableValue(product[field.key]),
    }));

  const colour = hasValue(product?.colour)
    ? product.colour
    : product?.color;
  if (hasValue(colour)) {
    variants.push({
      key: "colour",
      label: "Colour",
      value: displayableValue(colour),
    });
  }

  return variants;
}
