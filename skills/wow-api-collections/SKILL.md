---
name: wow-api-collections
description: Look up WoW Mount, Pet, Pet Battle, Toy, Stable, and Heirloom
  Collection APIs. Covers C_MountJournal (mount list, filtering, favorites,
  summoning, display info), C_PetJournal (pet collection, favorites, summoning,
  caging, abilities), C_PetBattles (pet battle system, turns, actions, pets,
  abilities, traps), C_PetInfo, C_ToyBox/C_ToyBoxInfo (toy collection, use,
  favorites), C_StableInfo (hunter pet stables), C_Heirloom/C_HeirloomInfo
  (heirloom collection, upgrades). Use when working with mount journal, pet
  journal, pet battles, toy box, heirloom collection, or hunter stables. Select
  Retail, Forever, or Classic with wow-client-targets before using historical
  listings.
---

# api collections

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify mount, pet, toy, heirloom and collection APIs individually. Do not treat the presence of one collection system as support for the others.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
