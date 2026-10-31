---
name: wow-api-encounters
description: Look up WoW Encounter Journal, Mythic+/Challenge Mode, Instance,
  Scenario, Raid Lock, and Season APIs. Covers EncounterJournal (dungeon/raid
  boss database, loot tables, section navigation), C_ChallengeMode (M+
  keystones, affixes, timers, best times), C_MythicPlus (weekly runs, seasonal
  data, rating), ScenarioInfo (delves/scenarios objectives and stages),
  InstanceLeaverInfo (deserter), RaidLocks (saved instances), C_SeasonInfo
  (seasonal info), and related events. Use when working with dungeon/raid
  encounter data, M+ keystones, mythic plus scores, scenario stages, raid
  lockouts, or seasonal content. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# api encounters

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify encounter journal, challenge-mode, scenario, timeline, and instance capabilities independently. Keep absent encounter systems out of target artifacts.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
