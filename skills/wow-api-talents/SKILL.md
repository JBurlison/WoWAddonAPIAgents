---
name: wow-api-talents
description: Look up WoW Class Talents, Hero Talents, Traits system,
  Specialization, and Profession Specialization APIs. Covers C_ClassTalents
  (loadouts, config management, talent tree interactions), C_Traits (the
  underlying trait system — nodes, entries, configs, currencies, conditions),
  C_SpecializationInfo (spec queries, recommended content), global
  specialization functions (GetSpecialization, GetSpecializationInfo,
  SetSpecialization), and profession specialization. Use when working with
  talent trees, talent loadouts, hero talent selection, trait nodes,
  specialization switching, or talent import/export. Select Retail, Forever, or
  Classic with wow-client-targets before using historical listings.
---

# api talents

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Trace the loaded talent UI and generated definitions before selecting class-trait, talent/glyph, or specialization APIs. Keep talent identifiers and operations target-specific; unsupported tree operations must be reported.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
