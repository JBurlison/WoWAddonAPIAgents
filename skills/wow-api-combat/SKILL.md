---
name: wow-api-combat
description: Look up WoW Combat, Damage Meter, Threat, Loss of Control, Combat
  Text, Combat Audio Alert, Secret Values, and Spectator APIs. Use when working
  with combat data, damage meters, threat, loss of control, combat text,
  encounter events, or any combat-related addon functionality. Select Retail,
  Forever, or Classic with wow-client-targets before using historical listings.
---

# api combat

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify addon access to combat logs, events, damage-meter data, threat and loss-of-control fields separately. Read security annotations and preserve opaque values. Retail 12.0 notes do not establish Forever or Classic restrictions.

For damage meters or Forever swing timers, start with [reviewed contracts](references/CURRENT-CONTRACTS.md): exact functions, payloads, structures, enums, client loading and access annotations. Runtime acceptance remains separate.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [RETAIL 12 0 CHANGES](references/RETAIL-12-0-CHANGES.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
