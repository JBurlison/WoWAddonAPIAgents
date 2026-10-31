---
name: wow-api-reputation
description: Look up WoW Reputation, Faction, Major Factions, Paragon, and
  Neighborhood Initiative APIs. Covers C_Reputation (faction info, standings,
  watched faction, headers, friendship reps, paragon), C_MajorFactions
  (Dragonflight+ renown factions, renown levels, rewards),
  C_NeighborhoodInitiative (12.0.0 housing neighborhood reputation), faction
  expansion data, and reputation-related events. Use when working with
  reputation tracking, faction standings, renown systems, paragon rewards,
  friendship reputations, or neighborhood initiatives. Select Retail, Forever,
  or Classic with wow-client-targets before using historical listings.
---

# api reputation

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify faction IDs, standing structures, friendship, renown, paragon, and account-wide behavior independently. Use only fields supported by the selected client.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
