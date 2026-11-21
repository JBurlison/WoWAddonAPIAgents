---
name: wow-api-settings-system
description: Look up WoW Settings registration, addon options menus, CVars, keybindings, gamepad input, sound/video, and Forever game rules across Retail, Forever, and Classic.
---

# WoW Settings & System API

Resolve the target client with [wow-client-targets](../wow-client-targets/SKILL.md) and follow [wow-addon-development](../wow-addon-development/SKILL.md) for UI mock-up, visual fidelity, localization, and testing rules.

## Target-specific decisions

- **Addon options:** Start with [addon options integration](references/ADDON-OPTIONS.md) for required menu discovery, registration lifetime, defaults/migrations, and profile switching. Keep internal identifiers unlocalized and follow [localization](../wow-addon-development/references/LOCALIZATION.md) for visible text.
- **Settings & CVar contracts:** Read [current settings contracts](references/CURRENT-SETTINGS.md) for `Settings.Create*` control helpers, `RegisterAddOnSetting`, `RegisterProxySetting`, combat-guarded `Settings.OpenToCategory`, and target-scoped `C_CVar` availability (`SetTempCVar`/`RemoveTempCVar` are Forever-only; `AreCVarsLoaded` is absent in Classic).
- **Controller-facing settings:** Apply [controller support](../wow-controller-support/SKILL.md) and [focus acquisition](../wow-controller-support/references/FOCUS-ACQUISITION.md) when building custom settings panels; preserve user bindings and CVars.
- **Owned namespaces vs Edit Mode:** This domain owns `C_CVar`, `C_KeyBindings`, `C_ClickBindings`, `C_TTSSettings`, `C_AccessibilityOptions`, `C_GamepadUI`, `C_GamepadTargeting`, `C_InputInterfaceStyle`, `C_Console`, sound/video, and `C_GameRules`. For **`C_EditMode` and `UISystemVisibilityManager` schemas**, query [wow-api-widget](../wow-api-widget/SKILL.md).
- **Forever game rules:** Use [Forever GameRules](references/FOREVER-GAME-RULES.md) for presets, Hardcore, and game-mode flags (distinguishing login-screen setters from in-game addon APIs).

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain. The [historical Retail baseline](references/RETAIL-BASELINE.md) and [CVars overview](references/CVARS-OVERVIEW.md) retain older reference listings; prefer [current settings contracts](references/CURRENT-SETTINGS.md) wherever they conflict.
