# Forever game rules and experience presets

Source-reviewed 2026-10-31 for **Forever 1.60.1.70532**, commit `ca8368f2f2380cbe696854f7f2646387c278a61b`. This guide distinguishes generated contracts and loaded Blizzard callers from third-party runtime access, which has not been tested. Read the complete `GameRules` declarations through the [API index](../../wow-api-index/SKILL.md) when implementing a particular operation.

## Identity is not a preset

`WOW_PROJECT_ID`, the interface number, the active game mode, a game-mode record ID and the user's experience preset answer different questions. Follow [client targets](../../wow-client-targets/SKILL.md) for project selection. Do not use a Classic/Modern preset to select a Classic progression/Retail API adapter: both presets are options inside Forever.

The [generated GameRules contract](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/GameRulesDocumentation.lua) defines 29 functions, six events and the `ForeverExperiencePreset` enum. Its `Environment = "All"` label does not prove addon access: this system includes login-screen operations.

| Operation | Exact declared contract | Use and limitation |
|---|---|---|
| `C_GameRules.GetForeverExperiencePreset()` | `preset: ForeverExperiencePreset?` | Preserve nil as unknown/unselected. Enum: `Classic = 0`, `Modern = 1`. |
| `C_GameRules.SetForeverExperiencePreset(preset)` | Required `ForeverExperiencePreset`; no return declared; `SecretArguments = AllowedWhenUntainted` | A configuration mutation demonstrated in Glue UI, not an addon-supported settings integration. See loading evidence below. |
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

The [Glue experience selector](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_GlueXML/Mainline/ExperiencePreset.lua#L88) calls the preset setter on a user click. This demonstrates a login-screen caller, not third-party addon permission. Do not build an in-game preset-switching button from that evidence alone.

The [Camelot nameplate override](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SettingsDefinitions_Frame/Camelot/NameplatesOverrides.lua) reads the preset. Its owning [SettingsDefinitions TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SettingsDefinitions_Frame/Blizzard_SettingsDefinitions_Frame.toc) selects game-specific files. The [Camelot game implementation](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_Game/Camelot/EventImplementation.lua) reads the Hardcore rule. These are stronger in-game source leads for read operations; they still do not resolve all tainted/secure access conditions.

## Events and state refresh

All six generated events below have `SynchronousEvent = true`. Use their literal names for frame-event research; do not infer that every event can be subscribed to by addons or that every rules change fires all of them.

| Literal event | Ordered payload |
|---|---|
| `ACTIVE_GAME_MODE_UPDATED` | `gameMode: GameMode` |
| `AVAILABLE_GAME_MODES_UPDATED` | No payload declared |
| `EVENT_REALM_QUEUES_UPDATED` | `eventRealmQueues: EventRealmQueues` |
| `GAME_MODE_DISPLAY_INFO_UPDATED` | No payload declared |
| `GAME_MODE_DISPLAY_MODE_TOGGLE_DISABLED` | `gameModeRecordID: number, disabled: bool` |
| `GAME_RULES_CHANGED` | No payload declared |

Use a verified initial query and refresh when a verified event relevant to that state is delivered. Do not assume `GAME_RULES_CHANGED` is a preset-change notification without checking the caller and testing. See [events](../../wow-api-events/SKILL.md) for validity, callback and registration distinctions.

## Beta history and acceptance

The older community capture from build 69893 contains `SelectClassicExperiencePreset` and `SelectModernExperiencePreset`; they are absent from this generated system. That difference is not proof of removal from the engine and is not permission to use them as fallbacks. The current source contract uses `GetForeverExperiencePreset` and `SetForeverExperiencePreset`.

Before enabling an addon feature, record the actual client build, initial data including nil cases, selected game/preset context, allowed read/write behavior and relevant event delivery. Leave Glue-only and unresolved operations out of the addon feature. Use [client validation](../../wow-addon-development/references/CLIENT-VALIDATION.md); no successful client probe is claimed by this guide.
