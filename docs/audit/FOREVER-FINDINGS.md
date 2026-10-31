# WoW Forever evidence and documentation gaps

> **Pre-2.0.0 audit snapshot.** Local gaps, counts and line numbers below describe the original review. See the [filled matrix](GAP-MATRIX.md) for the implementation status and remaining evidence boundaries.

Audit date: 2026-10-31. This is a source and documentation review, not an in-game validation. The current-source observations below refer to Gethe commit `ca8368f2f2380cbe696854f7f2646387c278a61b`, version `1.60.1.70532`, matching the repository's recorded Forever snapshot. Runtime observations from earlier beta builds remain separate.

## Evidence sources and their limits

| Source | Pin / build | What it establishes | What it cannot establish |
|---|---|---|---|
| [Gethe generated documentation](https://github.com/Gethe/wow-ui-source/tree/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated) and loaded UI source | `ca8368f2f2380cbe696854f7f2646387c278a61b`, 70532 | Declared functions, argument/return types, event payloads, enums, security annotations; TOCs and Lua show feature loading and usage | Successful third-party addon access in every context; undocumented engine exports; all runtime events |
| [forever-addon-kit captured API](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/data/forever_api.json) | Kit commit `8dc297689059dd204bf8663a05aaa36d6a628b76` (2026-09-25); capture metadata says `1.60.1`, build `69893`, interface `16001`, project `1`, locale `enUS` | Names observed in one running client | Current 70532 availability, signatures, event schemas, permitted access, clean Blizzard-only exports |
| [ForeverBeacon probe implementation](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/addons/ForeverBeacon/FB_Probe.lua) | Same kit commit | How the namespace/global inventory was collected | The date/time or full addon-load configuration of the stripped JSON capture |
| [WFG developer guide](https://wowforeverguides.com/addons/developers) and [API cheat sheet](https://wowforeverguides.com/addons/api-cheatsheet) | Read 2026-10-31; pages mix 69913 observations with retained 70338 source/probe notes | Research leads and explicitly dated reports | Uniformly current advice; the cheat sheet explicitly says its examples were not tested in game by its author |

The kit was fetched through the GitHub connector for provenance, then cloned for local bulk analysis because the connector returns text rather than a local searchable checkout. No kit code was run. Its README identifies the early beta beginning September 17, but the JSON itself contains no capture timestamp. Do not invent an exact capture date.

## Runtime inventory and coverage screening

The committed JSON contains **6,045 unique global function names, 11,417 named-frame entries, 269 namespaces, and 4,912 namespace-function pairs**. It contains **no events, function signatures, argument/return schemas, security annotations, or per-function load conditions**. The global inventory includes third-party names such as `EllesmereUI_ApplyDimLights`; the frame list includes `AceComm30Frame`. It must not be presented as 6,045 Blizzard APIs. These observations are directly reproducible from the [captured JSON](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/data/forever_api.json).

Screening the 133 Markdown files under maintained `skills/wow-*/` found exact fully-qualified token mentions for **1,346 of the 4,912** captured namespace functions; **3,566 have no such mention**. The 92-entry [namespace lookup](../../skills/wow-api-index/references/NAMESPACE-LOOKUP.md) names 91 of the 269 captured namespaces, leaving **178 unindexed capture namespaces**. These are discovery metrics, not a documentation-completeness percentage: a mention does not prove a correct signature, and unqualified member listings can evade this test. This scan excludes generated plugin copies to avoid double counting.

The structured [source inventory](api-coverage.json) extracts **4,376 distinct `C_` namespace functions** from 70532 generated declarations. Joining those names to the 69893 capture gives **4,286 in both sources, 626 captured-only, and 90 declared-only**. These differences are a reconciliation queue, not 626 removals and 90 additions: the sources differ in build, coverage and loading context, and declared-only names include internal/secure and platform-specific systems. The scanner keeps multiple documentation systems in one file separate and honors per-function namespace overrides: `GetDefaultAbbreviationBreakpoints` belongs to `C_StringUtil`, while `GetArenaOpponentSpec` and `InCombatLockdown` are globals. A simpler whole-file namespace regex incorrectly associates 11 global string utilities with `C_StringUtil`. The [reproducible set reconciliation](forever-runtime-comparison.json) lists every difference and pins both sources.

The kit's [event collector](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/addons/ForeverBeacon/FB_Core.lua) uses `RegisterAllEvents`, caps unique names, and records only the first eight arguments of the first observed occurrence, replacing non-scalar/secret values with descriptions. Those captures are not committed in `forever_api.json`. Even a future export from that collector would not prove every possible event/payload variant. Build the event catalogue from generated declarations, then use privacy-preserving runtime observations to validate registration, context and delivery.

## Prioritized Forever work matrix

P1 means a correctness issue, core Forever capability, or required evidence layer. P2 means broader coverage, discoverability, or additional regression work.

| Priority | Gap | Evidence and current documentation | Skill owner(s) | Required completion evidence |
|---|---|---|---|---|
| P1 | Damage-meter contract differs from the audited source | Historical combat reference lists `GetCurrentSessionID`, `GetSessions`, `GetSessionInfo`, `GetPlayerData`, `GetPartyData`, `ResetSessions`. None matches the eight generated/current captured function names below. | `wow-api-combat`, `wow-api-events`, index | Replace or quarantine those examples; document all eight functions, three events, structures and combat secrecy; exercise allowed display behavior in the target client. |
| P1 | Forever game rules and experience presets | `C_GameRules` has 29 functions in the 70532 declarations, with six events; no fully-qualified function mentions in maintained skills. The older capture has different preset setter names. | `wow-client-targets`, `wow-api-settings-system`, `wow-api-misc-systems`, events/index | Add source-pinned ruleset/preset/Hardcore guide; distinguish client identity, game-mode record, active mode, and user preset; include enum and nil behavior. |
| P1 | Swing timer is absent | Two generated functions and two events; its UI addon explicitly loads for Camelot. No `C_SwingTimer` or `PLAYER_SWING` entries in maintained skills. | `wow-api-combat`, `wow-api-events`, index | Add both signatures, payload ordering, enum, range-check subscription and nil semantics; verify third-party access separately from Blizzard UI use. |
| P1 | Legacy trees, challenges and reward track have no dedicated coverage | Camelot-only, load-on-demand `Blizzard_LegacySystem`; implemented through traits, achievements and major factions, not a `C_Legacy` namespace. | `wow-api-talents`, `wow-api-achievements`, `wow-api-reputation`, `wow-api-framexml`, events/index | Explain module dependencies, bootstrap helpers, configuration/tree IDs, staged currency, challenge criteria, renown rewards, and internal callbacks versus engine events. |
| P1 | No structured Forever event inventory | Kit JSON has no events. Historical event list is not a build-pinned Forever schema. | `wow-api-events`, client targets | Generate event rows with literal name, full payload and types, optional fields, synchronization/uniqueness flags, source SHA/path, target and runtime status. |
| P1 | Current project detection lacks the concrete loading trace | Existing source-evidence prose correctly warns about client conditions but omits the selected project constant and its defining TOC. | `wow-client-targets`, addon development | Record the `Blizzard_ProjectConstants` Camelot include and assignment to 18 for this source pin; preserve older project=1 only as history; probe the actual release client. |
| P1 | Source declarations and runtime exposure are not joined | Shared namespace presence is routinely mistaken for usable gameplay features. Kit capture is one older loaded client with addon globals. | client targets, all domains | Keep separate source-declared, runtime-observed, callable, restricted, not-observed, and unknown fields; record build/context/addons; never equate absence from one source with removal. |
| P1 | Secret values and opaque durations need a Forever-specific contract | Current aura/spell declarations carry access annotations; historical security references do not certify all Forever event payloads. | combat, unit-player, spells, widget, Lua environment | Field-level restriction notes for auras, health, cooldowns and meter data; permitted widget paths; out-of-combat/combat/instance cases; no blanket promise that a self-cast event is always plain. |
| P2 | CVar namespace discoverability | All 12 `C_CVar` members in the captured baseline lack qualified mentions; settings references concentrate on globals. | `wow-api-settings-system`, index | Verify present aliases and namespaced signatures; distinguish registered, temporary, per-character/account and persisted settings; test restart separately from reload. |
| P2 | UI integration and input routing | Runtime capture includes `C_EditMode`, `C_ClickBindings`, `C_GamePad`, `C_KeyBindings`; these are absent from the namespace routing table. Some click-binding prose already exists. | widget, settings, misc, index | Route every namespace, then review signatures, dependencies and protected operations; avoid treating routing gaps as proof that all prose is missing. |
| P2 | Beta defect history is mixed with present behavior | External guides and kit disagree across builds about secure snippets, project ID and persistence. | Lua environment, structure, client targets | Maintain dated defect/fix/retest records; do not apply obsolete compatibility patches to a current release. |

## Concrete contracts to add first

### Damage meter

The [70532 DamageMeter declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/DamageMeterDocumentation.lua) define:

| Function | Arguments | Return |
|---|---|---|
| `C_DamageMeter.GetAvailableCombatSessions` | none | `DamageMeterAvailableCombatSession[]` |
| `C_DamageMeter.GetCombatSessionFromID` | `sessionID, type` | `DamageMeterCombatSession` |
| `C_DamageMeter.GetCombatSessionFromType` | `sessionType, type` | `DamageMeterCombatSession` |
| `C_DamageMeter.GetCombatSessionSourceFromID` | `sessionID, type, sourceGUID?, sourceCreatureID?` | `DamageMeterCombatSessionSource` |
| `C_DamageMeter.GetCombatSessionSourceFromType` | `sessionType, type, sourceGUID?, sourceCreatureID?` | `DamageMeterCombatSessionSource` |
| `C_DamageMeter.GetSessionDurationSeconds` | `sessionType` | optional number |
| `C_DamageMeter.IsDamageMeterAvailable` | none | boolean, failure-reason string |
| `C_DamageMeter.ResetAllCombatSessions` | none | none |

The four session/session-source queries are annotated `SecretWhenInCombat`. Events are `DAMAGE_METER_COMBAT_SESSION_UPDATED(type: DamageMeterType, sessionID: number)`, `DAMAGE_METER_CURRENT_SESSION_UPDATED()`, and `DAMAGE_METER_RESET()`, each with `UniqueEvent = true`. Add nested structures and field-level annotations before writing usable examples. An existence check alone is insufficient.

### Swing timer

The [SwingTimer declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SwingTimerDocumentation.lua) define `EnableRangeCheck(swingType, enable)` and `IsTargetWithinSwingRange(swingType) -> bool?`. A nil result means a range check was unavailable, not that the target is out of range. Both functions have `SecretArguments = "AllowedWhenUntainted"`.

| Event | Ordered payload |
|---|---|
| `PLAYER_SWING` | `swingDuration: number, swingType: PlayerSwingType` |
| `PLAYER_SWING_RANGE_UPDATE` | `swingType: PlayerSwingType, isInRange: bool, checksRange: bool` |

Both are synchronous. The enum is MainHand=0, OffHand=1, Ranged=2. Ignore `isInRange` when `checksRange` is false. The [UI TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SwingTimer/Blizzard_SwingTimer.toc) confirms Camelot loading, but does not prove unrestricted addon range access.

### Game rules and presets

The [GameRules declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/GameRulesDocumentation.lua) include `GetForeverExperiencePreset() -> ForeverExperiencePreset?` and `SetForeverExperiencePreset(preset)`. The enum is Classic=0 and Modern=1. `GetCurrentGameModeRecordID()` returns a number; `GetActiveGameMode()` returns a `GameMode`; neither is the project constant.

| Event | Ordered payload |
|---|---|
| `ACTIVE_GAME_MODE_UPDATED` | `gameMode: GameMode` |
| `AVAILABLE_GAME_MODES_UPDATED` | none declared |
| `EVENT_REALM_QUEUES_UPDATED` | `eventRealmQueues: EventRealmQueues` |
| `GAME_MODE_DISPLAY_INFO_UPDATED` | none declared |
| `GAME_MODE_DISPLAY_MODE_TOGGLE_DISABLED` | `gameModeRecordID: number, disabled: bool` |
| `GAME_RULES_CHANGED` | none declared |

All six are synchronous. Do not assume either general rules event fires for every preset change without inspecting the relevant UI path or testing. The 69893 runtime capture instead contains `SelectClassicExperiencePreset` and `SelectModernExperiencePreset`; those names do not occur in this generated system. This is evidence of drift between sources/builds, not sufficient proof of removal from the engine.

### Legacy system and event boundaries

The [Legacy TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystem.toc) is Camelot-only and load-on-demand, with SharedTalentUI, AchievementUI, ProfessionsTemplates and LegacyChallengeTracker dependencies. Its [bootstrap](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystem_Bootstrap.lua) defines `LegacySystemFrame_LoadUI`, `ToggleLegacySystemUI`, `ToggleLegacyChallenges`, and `ShowLegacyChallenge`. The main toggle checks the reward-track faction's renown before loading.

The [utility implementation](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystemUtil.lua) uses `C_Traits.GetConfigIDByTreeID` and `GetTreeCurrencyInfo` with staged changes included, plus `C_MajorFactions.GetCurrentRenownLevel`. It publishes `Legacy.UpdateCurrencyInfo` through `EventRegistry`; this is an internal callback, not a name for `Frame:RegisterEvent`. Similar `Legacy.*` callbacks should have a separate catalogue from generated game events. No dedicated `C_Legacy` namespace appears in the reviewed runtime capture or this implementation.

## Conflicting and obsolete claims to keep out of current guidance

| Claim | Reconciliation |
|---|---|
| Forever always reports the Mainline project ID | The 69893 capture records 1. In 70532, [ProjectConstants TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_ProjectConstants/Blizzard_ProjectConstants.toc) includes the Camelot file only for that game type; [that file](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_ProjectConstants/Camelot/ProjectConstants.lua) assigns `WOW_PROJECT_CAMELOT = 18` and `WOW_PROJECT_ID` accordingly. Mainline architecture is not the same as a Mainline project ID. |
| Secure snippets are categorically broken; detect them by `loadstring_untainted` | The [kit README](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/README.md) reports a fix in 70009 and declares its old guard script obsolete. Current [EnvironmentCleanup TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_EnvironmentCleanup/Blizzard_EnvironmentCleanup.toc) has an unconditional optional restricted-environment dependency. Preserve the historical failure; validate actual snippet behavior on the target client. |
| SavedVariables never restore | Early kit reports are historical. WFG's developer guide notes a later report of a 70009 fix. There was no persistence test in this audit. Require clean logout/restart and `/reload` checks before recommending any bridge. |
| A swing timer is only a future possibility | Current generated definitions and Camelot-only UI source exist. Review their actual addon access and nil behavior instead of repeating an older announcement. |

## Required acceptance record

For each filled row, retain the target/build, commit and source path; exact symbol or event name; arguments/returns/payload fields; enum and structure links; environment and loading prerequisites; security annotations; documentation owner; example; and verification status. Runtime evidence additionally needs client build, timestamp, enabled addons, load-on-demand state, character/context, and reproduction steps. Do not save names, chat, or restricted values merely to demonstrate API coverage.

This audit does not establish complete Forever API coverage. A complete result needs both a generated declaration inventory and a curated catalogue of loaded FrameXML globals, mixins, widget methods and callbacks, followed by target-client tests for the intended addon operations.
