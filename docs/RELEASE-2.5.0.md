# 2.5.0: controller-aware UI development

The new [wow-controller-support](../skills/wow-controller-support/SKILL.md) skill covers controller interaction for addon-owned controls and native-window reskins. It separates device availability, input modality, cursor operation, directional navigation and protected actions; guides focus entry/return, modal ownership, activation, back/close, tabs, scrolling, recycled rows, text entry and visible action hints; and preserves mouse/keyboard behavior and user settings.

Controller assessment is now required for every UI change through the shared workflow, host agent adapters, instructions and UI skill entrypoints. Requirements and implementation templates retain interaction plans, per-client gaps, explicit user exclusions and outstanding controller checks across work sessions. Decorative regions do not need focus stops. Unavailable hardware does not remove the assessment or establish a support claim.

The skill contains original guidance and commit-pinned Blizzard source references. Native source presence, loading, addon permission and actual controller operation remain separate evidence states. Forever navigation internals must not be assumed callable from insecure addon code, and its higher-level navigation system must not be transplanted into Retail or Classic without verification.

## Evidence scope

Source review on **2026-11-07** used Forever `9dc84f0d3bbae1768ac3405b3716000bd93eda06` (1.60.1.70862), Retail `297d7aaaa736f346b3e036f38ee088eaf7f8c07f` (12.1.5.70783) and Classic progression `e5d9b3a22c3f0f6f41ebac0e454f4969594261cf` (5.5.4.70631). The [source map](../skills/wow-controller-support/references/SOURCE-MAP.md) records the inspected contracts and loading/access boundaries. This focused review does not advance the complete API snapshot registry, whose Forever baseline remains 1.60.1.70790. Fresh addon work must resolve the selected clients again; offline work must disclose the bundled versions and remaining uncertainty.

## Validation

- Deterministic reference/package generation and manifest, frontmatter and local-link validation passed: **38 skills**, **294 generated outputs**.
- All **68 Node tests** passed, including isolated-package references, generated API consistency and versioning policy.
- Isolated marketplace registration and installation passed in **Codex CLI 0.166.0**, **Claude Code 2.1.316** and **Copilot CLI 1.0.105**. Claude's installed inventory included the new skill. Normal user profiles were not changed.
- Independent planning evaluation passed four scenarios: a Forever settings panel with scrolling rows and a modal; an all-client character/spellbook reskin without hardware; an explicit scoped mouse-only exclusion; and a protected action requiring a verified secure input path. The plans preserved existing design/testing choices, per-client evidence and unperformed checks. An opt-in wording conflict in the native-control checklist was corrected.

These are source, packaging and planning checks. No in-game, simulator or physical-controller acceptance was performed. Each addon still needs the [per-client checks](../skills/wow-addon-development/references/CLIENT-VALIDATION.md), with source, static, simulated and actual-device results recorded separately.
