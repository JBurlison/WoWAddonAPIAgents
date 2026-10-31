---
name: wow-api-transmog
description: Look up WoW Transmogrification, Appearance Collection, Transmog
  Sets, Transmog Outfits, Dye Colors, and Barber Shop APIs. Covers
  C_Transmogrify (applying transmog at NPC), C_TransmogCollection (appearance
  source info, categories, search, collected status), C_TransmogSets (set
  collection, set info, base sets, variants), C_TransmogOutfits (outfit
  management, save/load), C_DyeColor/C_DyeColorInfo (armor dye system new in
  12.0.0), and C_BarberShop (customization). Use when working with transmog,
  appearance collections, wardrobe, transmog sets, outfit management, armor
  dyes, or character customization. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# api transmog

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify feature availability, collection/source/item identifiers, appearance state, and permitted application operations. A transmog namespace in shared docs does not establish a usable target feature.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
