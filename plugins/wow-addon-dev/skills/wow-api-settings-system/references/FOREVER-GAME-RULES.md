# Forever game rules and experience presets

Source-reviewed 2026-11-03 for **Forever 1.60.1.70707**, commit `aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16`. This guide distinguishes generated contracts and loaded Blizzard callers from third-party runtime access, which has not been tested. Read the complete `GameRules` declarations through the [API index](../../wow-api-index/SKILL.md) when implementing a particular operation.

## Identity is not a preset

`WOW_PROJECT_ID`, the interface number, the active game mode, a game-mode record ID and the user's experience preset answer different questions. Follow [client targets](../../wow-client-targets/SKILL.md) for project selection. Do not use a Classic/Enhanced preset to select a Classic progression/Retail API adapter: both presets are options inside Forever.

The [generated GameRules contract](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/GameRulesDocumentation.lua) defines 30 functions, seven events and the `ForeverExperiencePreset` enum. Its `Environment = "All"` label does not prove addon access: this system includes login-screen operations.

| Operation | Exact declared contract | Use and limitation |
|---|---|---|
| `C_GameRules.GetForeverExperiencePreset()` | `preset: ForeverExperiencePreset?` | Preserve nil as unknown/unselected. Enum: `Classic = 0`, `Enhanced = 1`. |
| `C_GameRules.SetForeverExperiencePresetPreLogin(preset)` | Required, non-nil `ForeverExperiencePreset`; no default or return declared; `SecretArguments = AllowedWhenUntainted` | Configuration mutation called by the Glue selector. Do not substitute it for the post-login operation. |
| `C_GameRules.SetForeverExperiencePresetPostLogin(preset)` | Required, non-nil `ForeverExperiencePreset`; no default or return declared; `SecretArguments = AllowedWhenUntainted` | Configuration mutation called by Blizzard's in-game Preset buttons. Third-party addon access and effects still require client validation. |
| `C_GameRules.GetActiveGameMode()` | `gameMode: GameMode` | Do not treat it as a project ID or game-mode record ID. |
| `C_GameRules.GetCurrentGameModeRecordID()` | `gameModeRecordID: number` | Record ID used by display/query functions. |
| `C_GameRules.GetCurrentGameModeDisplayInfo()` | `info: GameModeDisplayInfo?` | Metadata can be absent; preserve nil. |
| `C_GameRules.GetGameModeDisplayInfoByRecordID(gameModeRecordID)` | `info: GameModeDisplayInfo?`; secret arguments allowed only when untainted | Look up display metadata rather than deriving it from project constants. |
| `C_GameRules.IsGameRuleActive(gameRule)` | `isActive: bool`; argument `GameRule`; secret arguments allowed only when untainted | Use the selected build's enum, not arbitrary integers. |
| `C_GameRules.GetGameRuleAsFloat(gameRule, decimalPlaces = 0)` | `value: number`; secret arguments allowed only when untainted | Applies decimal scaling to the numeric rule. This is not interchangeable with a boolean rule query. |
| `C_GameRules.GetGameRuleAsFrameStrata(gameRule)` | `frameStrata: cstring`; secret arguments allowed only when untainted | Returns the rule interpreted as a frame strata. |
| `C_GameRules.IsHardcoreActive()` | `active: bool` | Has an in-game Camelot caller; still test intended addon use. |
| `C_GameRules.IsSelfFoundAllowed()` | `active: bool` | Capability/rule query, not proof that a character currently selected every related restriction. |

Other declared operations fall into distinct groups. Query the ledger for exact signatures before using them:

- Login and selection: `C_GameRules.AutoConnectToGameModeRealm`, `C_GameRules.IsCharacterlessLoginActive`, `C_GameRules.GetGameModeGlueScreenName`, `C_GameRules.GetCurrentEventRealmQueues`.
- Mode selection/display: `C_GameRules.GetNumDisplayedGameModes`, `C_GameRules.GetDisplayedGameModeRecordIDAtIndex`, `C_GameRules.IsGameModeEnabled`, `C_GameRules.IsClassAllowedForGameMode`, `C_GameRules.DoesGameModeHavePromo`, `C_GameRules.GetGameModePromoGlobalString`.
- Feature and mode queries: `C_GameRules.AccountHasSDEnabled`, `C_GameRules.IsSDHDToggleEnabled`, `C_GameRules.IsMultiActionBarVisibilityForced`, `C_GameRules.IsPersonalResourceDisplayEnabled`, `C_GameRules.IsPlunderstorm`, `C_GameRules.IsStandard`, `C_GameRules.IsWoWHack`.
- Display mutation: `C_GameRules.SetSDHDToggleValue(setToSD, usageLocation)` takes a boolean and `SdToggleUsageLocationUI`. That enum has `BeforeLogin`, `CharacterCreation`, `BarberShop` and `OptionsMenu` values; context is part of the operation.

## Loading and access evidence

The [Glue experience selector](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_GlueXML/Mainline/ExperiencePreset.lua#L138) calls `SetForeverExperiencePresetPreLogin` on a user click. Its [TOC](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_GlueXML/Blizzard_GlueXML.toc#L42) permits Glue loading and selects the experience files for Camelot. The internal frame name `ModernExperienceButton` remains, but the selected enum and displayed strings use Enhanced; do not infer an enum alias from that frame name.

The new [Preset settings implementation](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_SettingsDefinitions_Shared/Preset.lua#L55) returns immediately in Glue, reads the current preset for its header and registers Classic/Enhanced buttons that call `SetForeverExperiencePresetPostLogin`. The [SettingsDefinitions_Shared TOC](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_SettingsDefinitions_Shared/Blizzard_SettingsDefinitions_Shared.toc#L8) selects `Preset.lua` only for Camelot. Its registration goes through [SettingsRegistrar](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_Settings_Shared/Blizzard_SettingsRegistrar.lua), which waits for `VARIABLES_LOADED` and `PLAYER_ENTERING_WORLD` in game. This is source evidence for Blizzard's in-game preset switching; it supersedes the older Glue-only observation without proving addon permission. Prefer the built-in Preset panel until a custom switch's access and effects are tested.

The [Camelot nameplate override](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_SettingsDefinitions_Frame/Camelot/NameplatesOverrides.lua) also reads the preset. Its owning [SettingsDefinitions TOC](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_SettingsDefinitions_Frame/Blizzard_SettingsDefinitions_Frame.toc) selects game-specific files. The [Camelot game implementation](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_Game/Camelot/EventImplementation.lua) reads the Hardcore rule. These callers still do not resolve all tainted/secure access conditions.

## Events and state refresh

All seven generated events below have `SynchronousEvent = true`; each declared payload field is non-nil. Use their literal names for frame-event research; do not infer that every event can be subscribed to by addons or that every rules change fires all of them.

| Literal event | Ordered payload |
|---|---|
| `ACTIVE_GAME_MODE_UPDATED` | `gameMode: GameMode` |
| `AVAILABLE_GAME_MODES_UPDATED` | No payload declared |
| `EVENT_REALM_QUEUES_UPDATED` | `eventRealmQueues: EventRealmQueues` |
| `GAME_MODE_DISPLAY_INFO_UPDATED` | No payload declared |
| `GAME_MODE_DISPLAY_MODE_TOGGLE_DISABLED` | `gameModeRecordID: number, disabled: bool` |
| `GAME_RULES_CHANGED` | No payload declared |
| `SETTINGS_HEADER_TEXT_UPDATE` | No payload declared |

The loaded [Settings controls](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_Settings_Shared/Blizzard_SettingControls.lua#L79) register `SETTINGS_HEADER_TEXT_UPDATE` with `RegisterEvent`, then refresh the header through `customNameUpdateFunc`; dropdown controls also register it to refresh their selection text. The [Settings_Shared TOC](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_Settings_Shared/Blizzard_Settings_Shared.toc#L21) loads these controls. This is a frame-event consumer, not an `EventRegistry` callback. The source does not establish all engine emission conditions or addon delivery.

Use a verified initial query and refresh when a verified event relevant to that state is delivered. Neither `GAME_RULES_CHANGED` nor `SETTINGS_HEADER_TEXT_UPDATE` should be treated as a guaranteed notification of every preset change without client testing. See [events](../../wow-api-events/SKILL.md) for validity, callback and registration distinctions.

## Beta history and acceptance

The older community capture from build 69893 contains `SelectClassicExperiencePreset` and `SelectModernExperiencePreset`; they are absent from this generated system. Build 70532 declared `SetForeverExperiencePreset` and enum member `Modern = 1`; [the change to 70707](https://github.com/Gethe/wow-ui-source/compare/ca8368f2f2380cbe696854f7f2646387c278a61b...aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16) replaces that declaration with the pre/post-login setters and names enum value 1 `Enhanced`. Absence from the current generated contract does not prove removal from the engine or justify using old names as fallbacks.

Before enabling an addon feature, record the actual client build, initial data including nil cases, selected game/preset context, allowed read/write behavior and relevant event delivery. For a requested custom in-game switch, validate `SetForeverExperiencePresetPostLogin` from the intended addon context and observe the resulting preset, settings and event behavior; the getter or function's presence alone is insufficient. Leave Glue-only and unresolved operations out of the addon feature. Use [client validation](../../wow-addon-development/references/CLIENT-VALIDATION.md); no successful client probe is claimed by this guide.
