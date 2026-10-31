---
name: wow-api-events
description: Full reference for WoW frame events, payloads, and event handling
  patterns. Includes setup, registration, and categorized event lists with
  payloads. Select Retail, Forever, or Classic with wow-client-targets before
  using historical listings.
---

# api events

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify that each event is addon-facing, its payload and client availability, and registration lifecycle. Existence in a generated table does not imply addon subscription is permitted.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [EVENTS A F](references/EVENTS-A-F.md)
- [EVENTS G L](references/EVENTS-G-L.md)
- [EVENTS M R](references/EVENTS-M-R.md)
- [EVENTS S Z](references/EVENTS-S-Z.md)
- [EVENTS UNDOCUMENTED](references/EVENTS-UNDOCUMENTED.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
