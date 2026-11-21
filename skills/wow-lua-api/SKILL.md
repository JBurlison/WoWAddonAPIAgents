---
name: wow-lua-api
description: Look up WoW Lua 5.1 standard library, Blizzard extensions (`C_StringUtil`, `C_TableUtil`, `C_EncodingUtil`, `bit`), formatting helpers, and deprecated functions.
---

# WoW Lua 5.1 API

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Separate standard Lua behavior from WoW-specific extensions and restricted operations. Verify replacements for deprecated helpers on the selected target before removing a legacy adapter.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [Basic functions](references/BASIC_FUNCTIONS.md)
- [Bit library](references/BIT_LIBRARY.md)
- [Coroutine library](references/COROUTINE_LIBRARY.md)
- [Deprecated functions](references/DEPRECATED_FUNCTIONS.md)
- [Math library](references/MATH_LIBRARY.md)
- [Overview](references/OVERVIEW.md)
- [String details](references/STRING_DETAILS.md)
- [String library](references/STRING_LIBRARY.md)
- [Table details](references/TABLE_DETAILS.md)
- [Table library](references/TABLE_LIBRARY.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
