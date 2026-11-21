---
name: wow-api-unit-player
description: Look up WoW unit and player APIs for tokens, GUIDs, health, power, auras, stats, casting, threat, and inspection (`UnitHealth`, `C_UnitAuras`, `C_PaperDollInfo`).
---

# WoW Unit & Player API

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

For Forever changes, consult [source evidence](../wow-client-targets/references/SOURCE-EVIDENCE.md) and the [70707 baseline changes](../wow-client-targets/references/FOREVER-70707-CHANGES.md) before applying earlier build guidance.

Verify unit token restrictions, AuraData fields and UNIT_AURA payloads, health/power return types, identity and inspection APIs. Treat secret/opaque values according to their specific annotations.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [Player functions](references/PLAYER-FUNCTIONS.md)
- [Unit auras](references/UNIT-AURAS.md)
- [Unit health and power](references/UNIT-HEALTH-POWER.md)
- [Unit identity](references/UNIT-IDENTITY.md)
- [Unit state](references/UNIT-STATE.md)
- [Unit threat and combat](references/UNIT-THREAT-COMBAT.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
