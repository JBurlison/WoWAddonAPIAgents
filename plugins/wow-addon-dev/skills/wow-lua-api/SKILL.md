---
name: wow-lua-api
description: Verbose guide to Lua 5.1 functions available in WoW, including
  Blizzard-specific differences and WoW-only additions. Use for core Lua
  behavior in the WoW addon environment. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# lua api

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Separate standard Lua behavior from WoW-specific extensions and restricted operations. Verify replacements for deprecated helpers on the selected target before removing a legacy adapter.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [BASIC_FUNCTIONS](references/BASIC_FUNCTIONS.md)
- [BIT_LIBRARY](references/BIT_LIBRARY.md)
- [COROUTINE_LIBRARY](references/COROUTINE_LIBRARY.md)
- [DEPRECATED_FUNCTIONS](references/DEPRECATED_FUNCTIONS.md)
- [MATH_LIBRARY](references/MATH_LIBRARY.md)
- [OVERVIEW](references/OVERVIEW.md)
- [STRING_DETAILS](references/STRING_DETAILS.md)
- [STRING_LIBRARY](references/STRING_LIBRARY.md)
- [TABLE_DETAILS](references/TABLE_DETAILS.md)
- [TABLE_LIBRARY](references/TABLE_LIBRARY.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
