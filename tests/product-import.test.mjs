import test from "node:test";
import assert from "node:assert/strict";
import { parseProductImport, validateImportBatch } from "../lib/product-import.mjs";

const validProduct = {
  documentId: "sample-phone-001",
  name: "Sample Phone",
  brand: "Example Brand",
  categorySlug: "smartphones",
  description: "Test-only example.",
  imageUrl: "",
  tags: ["sample", "test-only"],
  store: [{ name: "Example Store", price: 1000, offer: "", url: "https://example.com/product" }],
};

test("accepts JSON array and {products: []} forms", () => {
  assert.equal(parseProductImport({ filename: "products.json", content: JSON.stringify([validProduct]) }).length, 1);
  assert.equal(parseProductImport({ filename: "products.json", content: JSON.stringify({ products: [validProduct] }) }).length, 1);
});

test("parses CSV quoting and store JSON column", () => {
  const csv = 'documentId,name,brand,categorySlug,description,imageUrl,tags,store\n' +
    'sample-phone-001,"Sample Phone, Plus",Example Brand,smartphones,"Line one\nLine two",,"sample|test-only",' +
    '"[{""name"":""Example Store"",""price"":1000,""offer"":""test"",""url"":""https://example.com/product""}]"';
  const product = parseProductImport({ filename: "products.csv", content: csv })[0];
  assert.equal(product.name, "Sample Phone, Plus");
  assert.equal(product.description, "Line one\nLine two");
  assert.deepEqual(product.tags, ["sample", "test-only"]);
  assert.equal(product.store[0].price, 1000);
});

test("accepts safe local product image paths used by the existing catalog", () => {
  const result = validateImportBatch([{ ...validProduct, imageUrl: "/products/sample-phone.jpg" }]);
  assert.equal(result.ok, true);
});

test("rejects unsafe local image paths", () => {
  const result = validateImportBatch([{ ...validProduct, imageUrl: "/products/../private.jpg" }]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("imageUrl")));
});

test("rejects missing document ID", () => {
  const result = validateImportBatch([{ ...validProduct, documentId: "" }]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("documentId")));
});

test("rejects non-positive prices", () => {
  const result = validateImportBatch([{ ...validProduct, store: [{ name: "Store", price: -2, url: "https://example.com/product" }] }]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("positive numeric price")));
});

test("rejects unsafe store URLs", () => {
  const result = validateImportBatch([{ ...validProduct, store: [{ name: "Store", price: 2, url: "javascript:alert(1)" }] }]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("valid HTTP(S) URL")));
});

test("rejects duplicate IDs and duplicate product identity within one file", () => {
  const result = validateImportBatch([validProduct, { ...validProduct, documentId: "sample-phone-001" }]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("duplicate documentId")));
  assert.ok(result.errors.some((error) => error.includes("duplicate name/brand/category")));
});

test("rejects more than 100 products", () => {
  const result = validateImportBatch(Array.from({ length: 101 }, (_, i) => ({ ...validProduct, documentId: "sample-" + i })));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("limited to 100")));
});
