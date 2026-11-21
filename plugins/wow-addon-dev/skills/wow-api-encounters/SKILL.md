---
name: wow-api-encounters
description: Look up WoW Encounter Journal, Mythic+/Challenge Mode, scenarios/delves, raid lockouts, instance, and season APIs (`C_EncounterJournal`, `C_ChallengeMode`, `C_MythicPlus`).
---

# WoW Encounters & Instances API

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify encounter journal, challenge-mode, scenario, timeline, and instance capabilities independently. Keep absent encounter systems out of target artifacts.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
