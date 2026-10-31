---
name: wow-api-weekly-rewards
description: Look up WoW Weekly Rewards (Great Vault) API. Covers
  C_WeeklyRewards — vault activities (M+, raids, PvP, world), reward selection,
  item preview, canEquip checks, vault UI state, and related events. Use when
  working with the Great Vault, weekly reward choices, vault activity tracking,
  or end-of-week item selection. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# api weekly rewards

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify the target has the requested weekly reward system before using Great Vault APIs. Do not replace an unavailable system with fabricated empty rewards.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
