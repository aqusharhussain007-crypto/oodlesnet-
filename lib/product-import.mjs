const MAX_PRODUCTS = 100;
const DOCUMENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseTags(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try { return JSON.parse(trimmed); } catch { return value; }
  }
  return trimmed.split("|").map((tag) => tag.trim()).filter(Boolean);
}

function parseStore(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return value;
  try { return JSON.parse(value); } catch { return value; }
}

function parseCsvRows(source) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const input = source.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  if (!rows.length) throw new Error("CSV file is empty.");
  const headers = rows.shift().map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error("CSV contains an empty column name.");
  if (new Set(headers).size !== headers.length) throw new Error("CSV contains duplicate column names.");
  return rows.map((cells, index) => {
    if (cells.length !== headers.length) {
      throw new Error("CSV row " + (index + 2) + " has " + cells.length + " fields; expected " + headers.length + ".");
    }
    return Object.fromEntries(headers.map((header, i) => [header, cells[i].trim()]));
  });
}

export function validateImportProduct(product, index = 0) {
  const label = "Product " + (index + 1) + ": ";
  if (!isRecord(product)) return label + "must be a JSON object.";
  if (typeof product.documentId !== "string" || !DOCUMENT_ID_PATTERN.test(product.documentId)) {
    return label + "documentId is required and may contain letters, numbers, underscores, or hyphens (max 100).";
  }
  if (typeof product.name !== "string" || product.name.trim().length < 2 || product.name.length > 180) return label + "name must be 2–180 characters.";
  if (typeof product.brand !== "string" || !product.brand.trim() || product.brand.length > 100) return label + "brand is required (max 100 characters).";
  if (typeof product.categorySlug !== "string" || !/^[a-z0-9-]{1,80}$/.test(product.categorySlug)) return label + "categorySlug must use lowercase letters, numbers, and hyphens.";
  if (product.description !== undefined && (typeof product.description !== "string" || product.description.length > 3000)) return label + "description must be text up to 3000 characters.";
  if (product.imageUrl !== undefined && product.imageUrl !== "" && !validHttpUrl(product.imageUrl)) return label + "imageUrl must be an HTTP(S) URL.";
  if (!Array.isArray(product.tags) || product.tags.length > 30 || product.tags.some((tag) => typeof tag !== "string" || tag.length > 50)) return label + "tags must be an array of up to 30 short strings.";
  if (!Array.isArray(product.store) || product.store.length < 1 || product.store.length > 15) return label + "store must contain 1–15 offers.";
  for (const offer of product.store) {
    if (!isRecord(offer) || typeof offer.name !== "string" || !offer.name.trim() || offer.name.length > 80) return label + "each store offer needs a valid name.";
    const price = Number(offer.price);
    if (!Number.isFinite(price) || price <= 0 || price > 100000000) return label + "each store offer needs a positive numeric price.";
    if (typeof offer.url !== "string" || !validHttpUrl(offer.url)) return label + "each store offer needs a valid HTTP(S) URL.";
    if (offer.offer !== undefined && (typeof offer.offer !== "string" || offer.offer.length > 500)) return label + "offer must be text up to 500 characters.";
  }
  return null;
}

function validImageUrl(value) {
  if (typeof value === "string" && /^\/products\/[A-Za-z0-9._/-]+$/.test(value) && !value.split("/").includes("..")) return true;
  return validHttpUrl(value);
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeImportProduct(product) {
  if (!isRecord(product)) return product;
  return {
    ...product,
    documentId: typeof product.documentId === "string" ? product.documentId.trim() : product.documentId,
    name: typeof product.name === "string" ? product.name.trim() : product.name,
    brand: typeof product.brand === "string" ? product.brand.trim() : product.brand,
    categorySlug: typeof product.categorySlug === "string" ? product.categorySlug.trim() : product.categorySlug,
    description: product.description === undefined ? "" : product.description,
    imageUrl: product.imageUrl === undefined ? "" : product.imageUrl,
    tags: parseTags(product.tags),
    store: parseStore(product.store),
  };
}

export function validateImportBatch(products) {
  if (!Array.isArray(products)) return { ok: false, errors: ["Import must contain a products array."] };
  if (products.length < 1) return { ok: false, errors: ["Import contains no products."] };
  if (products.length > MAX_PRODUCTS) return { ok: false, errors: ["Import is limited to 100 products per file."] };

  const normalized = products.map(normalizeImportProduct);
  const errors = [];
  const ids = new Set();
  const names = new Set();

  normalized.forEach((product, index) => {
    const error = validateImportProduct(product, index);
    if (error) errors.push(error);
    if (isRecord(product)) {
      if (typeof product.documentId === "string" && product.documentId.trim()) {
        if (ids.has(product.documentId.trim())) errors.push("Product " + (index + 1) + ": duplicate documentId inside this file.");
        ids.add(product.documentId.trim());
      }
      if (typeof product.name === "string" && typeof product.brand === "string" && typeof product.categorySlug === "string") {
        const key = [product.name, product.brand, product.categorySlug].map((v) => v.trim().toLocaleLowerCase("en")).join("|");
        if (names.has(key)) errors.push("Product " + (index + 1) + ": duplicate name/brand/category inside this file.");
        names.add(key);
      }
    }
  });

  return errors.length ? { ok: false, errors } : { ok: true, products: normalized, count: normalized.length };
}

export function parseProductImport({ filename = "", content = "" } = {}) {
  if (typeof content !== "string" || !content.trim()) throw new Error("Import file is empty.");
  const extension = filename.toLowerCase().split(".").pop();
  let products;

  if (extension === "json") {
    let parsed;
    try { parsed = JSON.parse(content); } catch { throw new Error("JSON file is not valid JSON."); }
    products = Array.isArray(parsed) ? parsed : parsed?.products;
  } else if (extension === "csv") {
    const rows = parseCsvRows(content);
    products = rows.map((row, index) => {
      const product = { ...row };
      product.tags = parseTags(product.tags);
      product.store = parseStore(product.store);
      return product;
    });
  } else {
    throw new Error("Choose a .csv or .json file.");
  }

  const result = validateImportBatch(products);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return result.products;
}
