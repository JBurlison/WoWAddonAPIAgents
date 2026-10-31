---
name: wow-api-achievements
description: Look up WoW Achievement, Statistics, and Achievement Criteria APIs.
  Covers C_AchievementInfo, global achievement functions (GetAchievementInfo,
  GetAchievementCriteriaInfo, GetStatistic, GetComparisonStatistic), achievement
  categories, guild achievements, achievement links, tracked achievements, toast
  notifications, and achievement-related events. Use when working with
  achievement tracking, achievement display, statistics, achievement criteria,
  guild achievements, or achievement completion detection. Select Retail,
  Forever, or Classic with wow-client-targets before using historical listings.
---

# api achievements

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify achievement identifiers, account/character scope, criteria return fields, and events. Expansion-specific achievements need an explicit availability check.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
