---
name: wow-api-misc-systems
description: Look up miscellaneous WoW APIs including NPC gossip, tooltips, player choices, tutorials, cinematics, Chromie Time, warbands, archaeology, and legacy expansion systems.
---

# WoW Miscellaneous Systems API

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

For addon text and translations, use [localization](../wow-addon-development/references/LOCALIZATION.md): catalogs/fallback, natural target-language meaning, formatting, layout and actual translation coverage. Native Locale/Localization declarations do not translate addon-owned text automatically.

Identify the particular subsystem first; verify its availability, owning addon, namespace, signatures, and security. A miscellaneous lookup is not evidence that all listed systems exist on a target.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
