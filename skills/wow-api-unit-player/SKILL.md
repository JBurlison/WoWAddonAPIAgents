---
name: wow-api-unit-player
description: Look up WoW Unit and Player APIs — UnitId tokens, GUIDs,
  health/power/stats, auras, roles, casting, threat, inspection, paper doll,
  death/resurrection, and player-specific functions. Use when querying unit
  identity, health, power, auras, stats, combat state, group membership, casting
  info, threat, or player character details. Select Retail, Forever, or Classic
  with wow-client-targets before using historical listings.
---

# api unit player

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify unit token restrictions, AuraData fields and UNIT_AURA payloads, health/power return types, identity and inspection APIs. Treat secret/opaque values according to their specific annotations.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [PLAYER FUNCTIONS](references/PLAYER-FUNCTIONS.md)
- [UNIT AURAS](references/UNIT-AURAS.md)
- [UNIT HEALTH POWER](references/UNIT-HEALTH-POWER.md)
- [UNIT IDENTITY](references/UNIT-IDENTITY.md)
- [UNIT STATE](references/UNIT-STATE.md)
- [UNIT THREAT COMBAT](references/UNIT-THREAT-COMBAT.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
