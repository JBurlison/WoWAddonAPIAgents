---
name: wow-addon-structure
description: Verbose guide for WoW AddOn structure, .toc metadata, loading
  order, SavedVariables, and C_AddOns metadata and load APIs. Use when planning
  addon folder layout, file order, or SavedVariables wiring. Select Retail,
  Forever, or Classic with wow-client-targets before using historical listings.
---

# addon structure

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify third-party TOC directives, client interface, addon loading APIs, dependencies, initialization order, and SavedVariables. Package a normal TOC per target rather than assuming every client supports the same suffixes or conditions.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [ADDON_STRUCTURE](references/ADDON_STRUCTURE.md)
- [C_ADDONS_API](references/C_ADDONS_API.md)
- [LOADING_LIFECYCLE](references/LOADING_LIFECYCLE.md)
- [SAVED_VARIABLES](references/SAVED_VARIABLES.md)
- [TOC_FORMAT](references/TOC_FORMAT.md)
- [VIEWING_BLIZZARD_UI](references/VIEWING_BLIZZARD_UI.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
