---
name: wow-api-guild
description: Look up WoW Guild Management, Guild Bank, Guild Info, and Guild
  Event APIs. Covers guild management functions (invite, promote, demote, kick,
  disband, MOTD, info), guild roster (GetGuildRosterInfo, GuildRoster, sorting),
  guild bank functions (GetGuildBankItemInfo, deposit, withdraw, tab management,
  permissions), guild perks/reputation, C_GuildInfo, and the Club API guild
  integration (guilds are ClubType.Guild in the Club system). Use when working
  with guild management, guild roster, guild bank, guild chat, guild events, or
  guild achievements. Select Retail, Forever, or Classic with wow-client-targets
  before using historical listings.
---

# api guild

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify roster loading, guild permissions, bank APIs and event payloads. Treat roster data as asynchronous where documented.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
