---
name: wow-api-framexml
description: Look up World of Warcraft FrameXML functions — global Lua
  functions, mixins, object pools, SharedXML utilities, and game utility
  modules. Use this for UI helpers (StaticPopup_Show, EasyMenu), formatting
  (SecondsToTime, FormatLargeNumber), table/math utils (tContains, Lerp),
  mixin/pool patterns, chat frame filters, tooltip helpers, bag functions,
  texture/atlas markup, and all FrameXML game utility modules. Select Retail,
  Forever, or Classic with wow-client-targets before using historical listings.
---

# api framexml

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Trace the owning Blizzard addon and its TOC/XML includes to the selected game type before using a mixin, pool, helper, or global. Verify load-on-demand dependencies and method signatures.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Start with [current loaded UI sources](references/CURRENT-UI-SOURCES.md) for pinned TOCs, mixins/pools, callback ownership, secure templates and the boundary between Lua helpers and native methods.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [CHATFRAME CONTAINERS](references/CHATFRAME-CONTAINERS.md)
- [FRAMEXML GAME UTILS](references/FRAMEXML-GAME-UTILS.md)
- [MIXINS AND POOLS](references/MIXINS-AND-POOLS.md)
- [SHAREDXML DATA UTILS](references/SHAREDXML-DATA-UTILS.md)
- [SHAREDXML UI UTILS](references/SHAREDXML-UI-UTILS.md)
- [UIPARENT](references/UIPARENT.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
