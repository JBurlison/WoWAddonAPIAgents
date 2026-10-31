---
name: wow-api-settings-system
description: Look up WoW Settings registration, CVars, input/keybindings,
  gamepad, Edit Mode, sound/video, time/build information and Forever game
  rules. Use for addon preferences, client options and settings integration.
  Resolve Retail, Forever or Classic with wow-client-targets first.
---

# api settings system

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify loaded Settings panel registration APIs, CVars and their permitted scopes, and client/build detection. If an integration is unavailable, use a verified custom configuration UI rather than guessing a legacy replacement.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

Start with [current settings contracts and integration](references/CURRENT-SETTINGS.md) for Settings registration, CVars and input/media boundaries. For Forever presets, Hardcore and game-mode rules, use [Forever GameRules](references/FOREVER-GAME-RULES.md); login-screen setters are not automatically addon APIs.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [CVARS OVERVIEW](references/CVARS-OVERVIEW.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
