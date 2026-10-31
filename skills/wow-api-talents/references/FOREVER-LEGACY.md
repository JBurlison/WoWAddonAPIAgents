# Forever Legacy integration

Source review: 2026-10-31; Forever `1.60.1.70532`, Gethe commit `ca8368f2f2380cbe696854f7f2646387c278a61b`. This guide documents the selected source and its UI behavior. Third-party addon operation tests have not been run. Use [client evidence](../../wow-client-targets/references/FOREVER.md) when targeting a different build.

## Loading and ownership

Legacy spans `C_Traits`, achievement APIs, `C_MajorFactions` and Lua-defined UI helpers. Do not invent a `C_Legacy` namespace. The [Blizzard_LegacySystem TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystem.toc) allows Camelot, is load-on-demand, and depends on SharedTalentUI, AchievementUI, ProfessionsTemplates and LegacyChallengeTracker. Its bootstrap is marked `[Bootstrap]`; the remaining helpers/mixins require the owning addon to load.

The [bootstrap](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystem_Bootstrap.lua) supplies these global Lua helpers:

| Helper | Source behavior |
|---|---|
| `LegacySystemFrame_LoadUI()` | Returns the result of `LoadAddOnWithErrorHandling` for this addon. |
| `ToggleLegacySystemUI()` | Returns early when reward-track renown is at most zero; loads the addon if needed, then toggles its frame. |
| `ToggleLegacyChallenges()` | Loads the addon, then invokes its challenge-page toggle on success. |
| `ShowLegacyChallenge(achievementID, closeOtherWindows)` | Loads the addon and opens the requested challenge on success; the second argument is not read by this implementation. |

These are Blizzard UI implementation helpers, not generated C API declarations or a promise of unrestricted calls. Presence, successful loading and permitted interaction are separate checks. Do not bypass the UI's lock/unlock checks by invoking a lower-level mutator.

## Trees, configuration and currency

The three tree IDs are selected from [`Constants.LegacyConsts`](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/LegacyConstantsDocumentation.lua), rather than inferred from class/spec IDs:

| Constant | Value at this build |
|---|---:|
| `LEGACY_TREE_PROFESSIONS_ID` | 1187 |
| `LEGACY_TREE_ADVENTURE_ID` | 1188 |
| `LEGACY_TREE_PROGRESSION_ID` | 1189 |
| `LEGACY_POINTS_TRAIT_CURRENCY_ID` | 4225 |
| `LEGACY_REWARD_TRACK_FACTION_ID` | 2802 |

Use named constants in implementation and keep these numbers scoped to the pin. A tree ID is not a configuration, node, entry, definition or currency ID. [LegacyTree.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacyTree.lua) resolves the selected tree through `C_Traits.GetConfigIDByTreeID`, then sets the config and talent tree on the shared panel. It stages changes and treats commit-in-progress separately from unapplied changes.

Relevant [SharedTraits declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SharedTraitsDocumentation.lua):

| Function | Arguments | Return |
|---|---|---|
| `C_Traits.GetConfigIDByTreeID` | `treeID` | `configID`, or no values |
| `C_Traits.GetConfigInfo` | `configID` | `TraitConfigInfo`, or no values |
| `C_Traits.GetTreeNodes` | `treeID` | ordered numeric node-ID array, or no values |
| `C_Traits.GetNodeInfo` | `configID, nodeID` | `TraitNodeInfo`, or no values |
| `C_Traits.GetEntryInfo` | `configID, entryID` | `TraitEntryInfo`, or no values |
| `C_Traits.GetDefinitionInfo` | `definitionID` | `TraitDefinitionInfo`, or no values |
| `C_Traits.GetTreeCurrencyInfo` | `configID, treeID, excludeStagedChanges` | `TreeCurrencyInfo[]` |
| `C_Traits.ConfigHasStagedChanges` | `configID` | boolean |
| `C_Traits.GetTraitCurrencyForAchievement` | `traitCurrencyID, achievementID` | amount number |
| `C_Traits.GetMaxAvailableTraitCurrency` | `traitCurrencyID, limitBySourcedMax` | maximum number |
| `C_Traits.ResetTree` | `configID, treeID` | success boolean; mutates staged tree state |

All listed functions declare `SecretArguments = "AllowedWhenUntainted"`; do not substitute secret identifiers into ordinary addon calls. For the first six, `MayReturnNothing` applies even though the declared returned field is non-nilable. Handle missing configuration/data before traversing. Inspect referenced structures at the same source pin before using extra fields.

`TreeCurrencyInfo` contains numeric `traitCurrencyID`, `quantity`, `spent`, and optional numeric `maxQuantity`, `spentInTree`. The [Legacy utility](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystemUtil.lua) queries the first Legacy tree with `excludeStagedChanges = false`, takes its first currency entry and adds `renownCurrency` from the reward-track faction. Match that choice only when your display should include staged edits; a committed-state display needs a deliberate different choice. Its cached result may be absent until configuration and currency data exist.

The same utility defines `LegacySystem.GetCurrencyInfo()`, `UpdateCurrencyInfo()`, and `RegisterCurrencyInfoCallback(owner, method)`. The callback helper invokes `method(owner, currencyInfo)` immediately if data is available, then registers future updates. It also defines `GetFilteredChallenges()`, `IsChallengeVisible(filteredChallenges, achievementId, wasEarnedByMe)` and `GetChallengeIndices(categoryID)` for the built-in challenge list. Treat these as internal UI contracts, not generic replacements for direct achievement queries.

## Challenges and reward track

[LegacyChallenges.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacyChallenges.lua) uses achievement records, search/filter state and criteria updates. Character completion matters: [LegacySystemUtil.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystemUtil.lua) treats an achievement earned by another character as incomplete for its filter. Do not replace that logic with account-wide completion alone. See [achievements](../../wow-api-achievements/SKILL.md) for the underlying system.

[LegacyRewardTrack.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacyRewardTrack.lua) first queries faction data; it defers refresh if that data is absent. It builds cards from the faction's renown levels and each level's rewards. Relevant [MajorFactions contracts](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/MajorFactionsDocumentation.lua) are:

| Function | Return |
|---|---|
| `C_MajorFactions.GetCurrentRenownLevel(majorFactionID)` | number |
| `C_MajorFactions.GetMajorFactionData(majorFactionID)` | optional `MajorFactionData` |
| `C_MajorFactions.GetRenownLevels(majorFactionID)` | `MajorFactionRenownLevelInfo[]` |
| `C_MajorFactions.GetRenownRewardsForLevel(majorFactionID, renownLevel)` | `MajorFactionRenownRewardInfo[]` |

All four declare `SecretArguments = "AllowedWhenUntainted"`. Preserve the distinction between trait points and renown, even when the built-in UI shows both. See [reputation](../../wow-api-reputation/SKILL.md) for broader major-faction behavior.

## Engine events versus UI callbacks

These generated engine events have `SynchronousEvent = true`. Subscribe only to events needed by the feature; verify runtime validity/registration/delivery for the target build.

| Engine event | Ordered payload | Definition |
|---|---|---|
| `TRAIT_CONFIG_UPDATED` | `configID: number` | [SharedTraits](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SharedTraitsDocumentation.lua) |
| `TRAIT_TREE_CHANGED` | `treeID: number` | SharedTraits |
| `TRAIT_NODE_CHANGED` | `nodeID: number` | SharedTraits |
| `TRAIT_TREE_CURRENCY_INFO_UPDATED` | `treeID: number` | SharedTraits |
| `ACHIEVEMENT_EARNED` | `achievementID: number, alreadyEarned: bool?` | [AchievementInfo](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/AchievementInfoDocumentation.lua) |
| `CRITERIA_UPDATE` | none declared | AchievementInfo |
| `ACHIEVEMENT_SEARCH_UPDATED` | none declared | AchievementInfo |

The following are **Lua `EventRegistry` callbacks**, emitted by the loaded Legacy UI. Do not pass them to `Frame:RegisterEvent`, and do not assume they fire while that UI is unloaded.

| Callback | Emitted payload | Source producer |
|---|---|---|
| `Legacy.UpdateCurrencyInfo` | currency table with `renownCurrency` | [SystemUtil](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystemUtil.lua) |
| `Legacy.SelectTree` | tree-list index | [Tree](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacyTree.lua) |
| `Legacy.SelectPage` | page index | [System](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystem.lua) |
| `Legacy.OpenToChallengeCategory` | category ID | [Challenges](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacyChallenges.lua) |
| `Legacy.RefreshChallenges` | none | Challenges |
| `Legacy.SelectChallenge` | achievement ID | Challenges |
| `Legacy.UpdateChallenge` | selected element's internal data table | Challenges |
| `Legacy.SelectChallengeCategory` | selected category's internal info table | [CategoryList](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacyChallengeCategoryList.lua) |
| `Legacy.RefreshCategoryButtonCollapseState` | none | CategoryList |
| `Legacy.UnviewedChallengesUpdated` | none | [ChallengeTracker](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_LegacyChallengeTracker/Blizzard_LegacyChallengeTracker.lua) |

Internal element/category tables are UI implementation data, not generated engine structures. Follow their producer before using fields. The [callback registry](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SharedXMLBase/CallbackRegistry.lua) takes `(event, func, owner, ...)`; ordinary callbacks receive the owner before emitted payload. Use a stable owner and unregister that owner's subscription when your feature is disposed. Registering the same owner/event replaces its previous callback. Do not emit Blizzard's internal callbacks to impersonate a user action.

## Acceptance before claiming support

Record locked/unlocked character state, pre/post load-on-demand state, selected tree, staged versus committed points, absent-data handling, challenge completion/criteria refresh and reward-track refresh. Confirm callback cleanup when closing/reopening your own feature. A read-only viewer should not reset or commit trees merely to populate a display. Mutation features require their own permitted-interaction and combat-lockdown tests. Use the [runtime procedure](../../wow-addon-development/references/RUNTIME-VALIDATION.md); all such client checks are currently not-run for this documentation.
