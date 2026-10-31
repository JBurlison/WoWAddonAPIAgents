---
name: wow-api-misc-systems
description: Catch-all reference for smaller WoW API systems that don't warrant
  individual skills. Covers Tutorial, ReportSystem, SplashScreen, Cinematic,
  ChromieTimeInfo, AlliedRaces, UserFeedback, WarbandSceneInfo, ResearchInfo
  (archaeology), Log, EventUtils, SlashCommand, ClickBindings, TooltipInfo,
  TooltipComparison, GossipInfo (NPC dialog), PlayerChoice,
  PlayerInteractionManager, ImmersiveInteraction, Localization, Locale,
  MirrorTimer, ModelInfo, Movie, ParentalControls, PerksActivities,
  RecruitAFriend, ContributionCollector, GarrisonInfo (legacy),
  Covenant/Soulbinds (legacy), AzeriteItem (legacy), and other utility
  namespaces. Use when working with NPC gossip/dialog, player choices, tooltips,
  tutorials, cinematics, Chromie Time, allied races, warbands, report system, or
  any miscellaneous game system. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# api misc systems

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Identify the particular subsystem first; verify its availability, owning addon, namespace, signatures, and security. A miscellaneous lookup is not evidence that all listed systems exist on a target.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
