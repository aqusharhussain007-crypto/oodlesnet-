#!/usr/bin/env node
/**
 * Read-only attribute-definition seed validator.
 * It never connects to Firebase and never writes data.
 * Optional --existing path accepts a JSON export of existing documents
 * (either an array of {id,...data} or an object keyed by document ID).
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SEED = path.join(ROOT, "data/attribute-definitions.seed.json");

function normalize(value) {
  return String(value || "").trim().toLowerCase()
    .replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function existingMap(value) {
  const rows = Array.isArray(value)
    ? value
    : Object.entries(value || {}).map(([id, data]) => ({ id, ...(data || {}) }));
  return new Map(rows.map((row) => [String(row.id || row.key || ""), row]));
}

function validateSeed(seed, existing = null) {
  const errors = [];
  const warnings = [];
  const definitions = seed && seed.definitions;
  if (!seed || seed.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (!seed || seed.collection !== "attribute_definitions") errors.push("collection must be attribute_definitions.");
  if (!Array.isArray(definitions) || !definitions.length) {
    errors.push("definitions must be a non-empty array.");
    return { ok: false, errors, warnings, actions: [] };
  }

  const allowedTypes = new Set(["text", "enum", "list", "number", "measurement"]);
  const seenKeys = new Set();
  const aliasOwners = new Map();
  const actions = [];

  for (const [index, item] of definitions.entries()) {
    const where = "definitions[" + index + "]";
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(where + " must be an object.");
      continue;
    }
    const key = normalize(item.key);
    if (!key) errors.push(where + " has no valid key.");
    if (seenKeys.has(key)) errors.push("Duplicate document key: " + key);
    seenKeys.add(key);
    if (!String(item.label || "").trim()) errors.push(where + " is missing label.");
    if (!allowedTypes.has(item.dataType)) errors.push(where + " has unsupported dataType.");
    if (!Array.isArray(item.aliases)) errors.push(where + ".aliases must be an array.");
    if (!Array.isArray(item.appliesTo) || !item.appliesTo.length) errors.push(where + ".appliesTo must be a non-empty array.");
    if (typeof item.comparable !== "boolean" || typeof item.filterable !== "boolean" || typeof item.active !== "boolean") {
      errors.push(where + " must define comparable, filterable and active booleans.");
    }
    for (const alias of item.aliases || []) {
      const aliasKey = normalize(alias);
      if (!aliasKey) {
        errors.push(where + " contains an empty alias.");
        continue;
      }
      if (aliasKey !== key && seenKeys.has(aliasKey)) errors.push("Alias collides with document key: " + aliasKey);
      if (aliasOwners.has(aliasKey) && aliasOwners.get(aliasKey) !== key) {
        errors.push("Alias collision: " + aliasKey + " is used by " + aliasOwners.get(aliasKey) + " and " + key);
      } else {
        aliasOwners.set(aliasKey, key);
      }
    }
    if (item.dataType === "measurement" && !String(item.unit || "").trim()) {
      errors.push(where + " measurement requires a unit.");
    }
    if (key) {
      const current = existing && existing.get(key);
      actions.push({
        id: key,
        action: existing ? (current ? "update" : "create") : "would_use_id",
        label: item.label,
      });
    }
  }

  for (const aliasKey of aliasOwners.keys()) {
    if (seenKeys.has(aliasKey) && aliasOwners.get(aliasKey) !== aliasKey) {
      errors.push("Alias collides with a canonical key: " + aliasKey);
    }
  }
  if (!existing) warnings.push("Existing Firestore documents were not checked; action is shown as would_use_id.");
  if (existing) {
    for (const id of existing.keys()) {
      if (!seenKeys.has(normalize(id))) warnings.push("Existing document not present in seed (left untouched): " + id);
    }
  }
  return { ok: errors.length === 0, errors, warnings, actions };
}

function main() {
  const args = process.argv.slice(2);
  const existingFlag = args.indexOf("--existing");
  const seedPath = args.find((arg) => !arg.startsWith("--") && !(existingFlag >= 0 && args.indexOf(arg) === existingFlag + 1)) || DEFAULT_SEED;
  let existing = null;
  if (existingFlag >= 0) {
    const existingPath = args[existingFlag + 1];
    if (!existingPath) throw new Error("--existing requires a JSON file path.");
    existing = existingMap(readJson(path.resolve(existingPath)));
  }
  const result = validateSeed(readJson(path.resolve(seedPath)), existing);
  process.stdout.write(JSON.stringify({
    mode: "DRY_RUN_ONLY",
    writesPerformed: 0,
    collection: "attribute_definitions",
    definitionCount: result.actions.length,
    ...result,
  }, null, 2) + "\n");
  if (!result.ok) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { normalize, existingMap, validateSeed };
