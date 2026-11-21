---
name: wow-api-escape-sequences
description: Look up WoW UI pipe escape sequences for colors, inline textures, atlas icons, grammar inflections, and Kstrings (`WrapTextInColorCode`, `CreateAtlasMarkup`).
---

# WoW UI Escape Sequences API

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify supported escape/markup forms and restrictions for the intended FontString, chat, or tooltip surface. Do not parse restricted combat text as a data API.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
