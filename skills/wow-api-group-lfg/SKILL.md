---
name: wow-api-group-lfg
description: Look up WoW Party, Raid, Dungeon Finder, Premade Groups (LFG List),
  Social Queue, Lobby Matchmaker, and Raid Marker APIs. Covers C_PartyInfo
  (party management, invites, conversion, ready check, countdown), C_LFGInfo
  (dungeon finder queue, role selection), C_LFGList (premade groups listing,
  search, application, creation), C_SocialQueue (friend queue tracking),
  C_LobbyMatchmakerInfo, raid markers, and group-related events. Use when
  working with party/raid management, group finder, premade group listing,
  dungeon queue, role selection, ready checks, or raid markers. Select Retail,
  Forever, or Classic with wow-client-targets before using historical listings.
---

# api group lfg

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify party/raid, queue, role, premade-group and difficulty APIs independently. Check protected actions, leader permissions, identifiers, and event payloads.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
