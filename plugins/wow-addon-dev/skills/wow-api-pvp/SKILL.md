---
name: wow-api-pvp
description: Look up WoW PvP, Battlegrounds, Arenas, Rated PvP, War Mode, Duels,
  War Games, and Honor/Conquest APIs. Covers C_PvP (PvP info, rated stats,
  rewards, battlegrounds, arenas, war mode, brawls, special events), duel
  functions (AcceptDuel, CancelDuel, StartDuel), war game functions,
  honor/conquest tracking, PvP talent integration, and PvP-related events. Use
  when working with PvP systems, battlegrounds, arenas, rated PvP, war mode,
  honor, conquest, duels, or PvP UI. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# api pvp

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify battleground/arena queues, ratings, honor currencies, war mode, matchmaking, and protected queue actions separately. Do not equate similarly named statistics across clients.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
