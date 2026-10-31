---
name: wow-api-settings-system
description: Documents console variables (CVars), how to query and set them,
  console command usage, scope rules, and reset behavior for WoW. Use when
  working with CVars, /console, SetCVar, GetCVar, GetCVarInfo, Config.wtf, or
  settings system behavior. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# api settings system

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify loaded Settings panel registration APIs, CVars and their permitted scopes, and client/build detection. If an integration is unavailable, use a verified custom configuration UI rather than guessing a legacy replacement.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [CVARS OVERVIEW](references/CVARS-OVERVIEW.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
