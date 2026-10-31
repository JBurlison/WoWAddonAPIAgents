---
name: wow-api-social-chat
description: Look up WoW Chat, Social, Club/Community, Friend List, Voice Chat,
  BattleNet, Ping, Social Queue, and Addon Messaging APIs. Covers C_ChatInfo,
  C_Club, C_ClubFinder, C_FriendList, C_BattleNet, C_VoiceChat,
  C_SocialRestrictions, C_SocialQueue, C_RecentAllies, C_PingManager,
  C_TTSSettings, ChatFrame functions, chat filters, addon message system, and
  12.0.0 instance restrictions (SendAddonMessage blocked, chat messages may be
  secret). Use when working with chat output, chat channels, communities, friend
  lists, voice chat, BattleNet friends, addon communication, social features, or
  ping system. Select Retail, Forever, or Classic with wow-client-targets before
  using historical listings.
---

# api social chat

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify chat channels, message restrictions, addon communication limits, club/Battle.net APIs, and event payloads per client and context. Do not assume instance communication restrictions are identical.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
