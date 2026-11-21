---
name: wow-addon-structure
description: WoW addon structure, .toc metadata, file load order, SavedVariables, C_AddOns, and C_AddOnProfiler APIs. Use when organizing addon files, wiring dependencies, or persisting saved data.
---

# WoW Addon Structure

Resolve the target client with [wow-client-targets](../wow-client-targets/SKILL.md) and follow [wow-addon-development](../wow-addon-development/SKILL.md) for project localization and options baselines.

## Target-specific decisions

Start with [current structure contracts](references/CURRENT-STRUCTURE.md) for multi-version TOC packaging rules, exact `C_AddOns` return tuples, `C_AddOnProfiler`, lifecycle event payloads, modern TOC metadata (`AddonCompartmentFunc`, `Group`, localized tags), and safe SavedVariables migrations.

Package one standard `<Addon>.toc` per client build rather than copying Blizzard's internal `[Family]`/`[Game]` or `AllowLoadGameType` directives into third-party TOCs. Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md) and verify loading order and dependencies per target.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete `C_AddOns` and `C_AddOnProfiler` contracts. The [historical Retail baseline](references/RETAIL-BASELINE.md) and supporting files retain older reference prose; prefer [current structure contracts](references/CURRENT-STRUCTURE.md) wherever they conflict:

- [Current structure contracts](references/CURRENT-STRUCTURE.md)
- [Addon structure](references/ADDON_STRUCTURE.md)
- [C_AddOns API](references/C_ADDONS_API.md)
- [Loading lifecycle](references/LOADING_LIFECYCLE.md)
- [SavedVariables](references/SAVED_VARIABLES.md)
- [TOC format](references/TOC_FORMAT.md)
- [Viewing Blizzard UI](references/VIEWING_BLIZZARD_UI.md)
