---
name: wow-api-housing
description: Look up WoW Player Housing APIs (new in Patch 12.0.0). Covers
  HousingUI (core housing system), C_HouseEditorUI (placement/editing modes),
  C_HousingCatalog (decoration catalog), HousingBasicModeUI,
  HousingCleanupModeUI, HousingCustomizeModeUI, HousingDecorUI,
  HousingExpertModeUI, C_HouseExteriorUI (exterior customization),
  HousingLayoutUI, C_HousingNeighborhood (neighborhoods/visiting),
  C_NeighborhoodInitiative (community goals), and CatalogShop. Use when working
  with player housing placement, decoration, editing modes, neighborhoods,
  housing catalogs, exterior customization, or neighborhood initiatives. Select
  Retail, Forever, or Classic with wow-client-targets before using historical
  listings.
---

# api housing

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Establish actual housing feature availability through loaded UI and addon-facing APIs first. Housing files occur in multiple branches and are not proof of support; omit the module when unavailable and flag unresolved availability.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
