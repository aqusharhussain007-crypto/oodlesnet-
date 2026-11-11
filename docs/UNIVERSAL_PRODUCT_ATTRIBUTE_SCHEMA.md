# OodlesNet Universal Product Attribute Schema (TEST proposal)

## Goals
- One product attribute shape for every category and future category.
- Attribute definitions are Firestore data, not hard-coded comparison branches.
- Missing values stay missing; extraction must never invent facts.
- Preserve original values and provenance for auditability.

## Firestore collections

### `attribute_definitions/{attributeKey}`
Suggested document:
```json
{
  "key": "battery_life",
  "label": "Battery life",
  "aliases": ["playback time", "runtime"],
  "dataType": "measurement",
  "unit": "hours",
  "appliesTo": ["earbuds", "headphones"],
  "comparison": "numeric",
  "filterable": true,
  "comparable": true,
  "active": true,
  "schemaVersion": 1
}
```

Fields:
- `key`: stable snake_case identifier.
- `label`: customer-facing label.
- `aliases`: optional names used by source descriptions/imports.
- `dataType`: text | number | measurement | boolean | enum | list | date.
- `unit`: canonical unit for measurements; omit for non-measurements.
- `appliesTo`: product-type identifiers; use ["*"] for universal fields.
- `comparison`: exact | numeric | set | range | none.
- `filterable`, `comparable`, `active`: feature flags.
- `schemaVersion`: version for future migrations.

### Product document (backward-compatible additions)
Existing fields remain unchanged. Add optional fields:
```json
{
  "productType": "earbuds",
  "attributes": {
    "battery_life": { "value": 48, "unit": "hours", "raw": "Up to 48 hours" },
    "bluetooth_version": { "value": "5.4" }
  },
  "attributeSources": {
    "battery_life": {
      "sourceType": "manufacturer",
      "sourceUrl": null,
      "extractedFrom": "description",
      "confidence": "explicit",
      "verifiedAt": null
    }
  },
  "variants": {
    "colour": ["Black"],
    "size": []
  },
  "attributeSchemaVersion": 1
}
```

For compatibility, the comparison reader must continue accepting legacy `specs`, `specifications`, flat `attributes`, and current product fields. New structured attribute values use the {value, unit, raw} envelope; plain values remain valid.

## Comparison rules
1. Build candidate rows from the union of keys present on either product.
2. Resolve labels and aliases through the registry.
3. Hide a row only when neither product has a value.
4. If one side is missing, show "Not available" on that side.
5. Compare only when the definition says `comparable: true` and the data type supports it.
6. Normalize compatible units before numeric comparison; never compare unlike units.
7. Variants (size, colour, capacity/model variant) are shown separately from performance/specification attributes.
8. Description extraction may populate a field only when a registry label/alias is explicitly present in the source text. Keep raw text and provenance.
9. Do not auto-promote low-confidence guesses to verified attributes.

## Rollout safety
- TEST branch and `oodlesnet-test` only during development.
- No production Firestore writes or migrations in this phase.
- Seed definitions in batches with deterministic document IDs and merge semantics.
- Keep old product documents readable; migrate gradually when products are next edited.
- Add tests for every new data type and unit conversion before enabling it.
