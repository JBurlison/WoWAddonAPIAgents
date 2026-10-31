---
name: wow-api-escape-sequences
description: Look up World of Warcraft UI escape sequences — pipe-character
  sequences embedded in text strings to produce colors, inline textures, atlas
  icons, grammar inflections, word-wrap hints, Kstrings, and other special
  rendering. Use when formatting chat output, tooltip text, FontString content,
  or any UI text that needs color codes, inline icons, named colors,
  item-quality colors, texture markup, atlas markup, localized grammar forms, or
  escape-sequence utilities like WrapTextInColorCode, CreateTextureMarkup,
  CreateSimpleTextureMarkup, and CreateAtlasMarkup. Select Retail, Forever, or
  Classic with wow-client-targets before using historical listings.
---

# api escape sequences

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify supported escape/markup forms and restrictions for the intended FontString, chat, or tooltip surface. Do not parse restricted combat text as a data API.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
