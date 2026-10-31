# Forever build evidence

Reviewed 2026-10-31 against Gethe commit `ca8368f2f2380cbe696854f7f2646387c278a61b`, [version 1.60.1.70532](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/version.txt). Source-verified observations below are not in-game test results. Confirm the actual client build before applying them to a release.

## Client identity and loading

| Identifier | Evidence / meaning at this pin | Use |
|---|---|---|
| Interface `16001` | Derived from version 1.60.1; earlier runtime capture also reports 16001 | Confirm with the fourth `GetBuildInfo()` result when packaging. It does not identify the API family by numeric magnitude. |
| `WOW_PROJECT_CAMELOT = 18` | Defined in the Camelot project constants; `WOW_PROJECT_ID` is assigned that named constant | A source-backed detection input for this build, alongside explicit package target and required capabilities. |
| Mainline architecture | Family selection and game-specific selection coexist in the source tree | Does not imply `WOW_PROJECT_ID == WOW_PROJECT_MAINLINE`. |
| Active game mode / record / experience preset | Separate `C_GameRules` queries | Gameplay rules and preferences are not project or interface identifiers. See [settings-system](../../wow-api-settings-system/SKILL.md). |

The decisive project-ID trace is [Blizzard_ProjectConstants.toc](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_ProjectConstants/Blizzard_ProjectConstants.toc): it loads shared constants, then `Camelot\ProjectConstants.lua` with `AllowLoadGameType camelot`. The [selected file](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_ProjectConstants/Camelot/ProjectConstants.lua) assigns both the named constant and project ID. This is stronger evidence than finding a constant somewhere in the tree.

[FrameXMLBase.toc](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_FrameXMLBase/Blizzard_FrameXMLBase.toc) separately excludes Camelot from `[Family]\Constants.lua` and selects `[Game]\Constants.lua` for it. Trace the owning TOC for each feature; sharing a branch or namespace does not prove loading. These are Blizzard source directives, not blanket advice to copy them into third-party TOCs.

For a shared addon, compare named project constants when present, then validate the required API and packaged target. Do not substitute a fabricated Retail interface number to make a version test pass. An unrecognized project/build should remain unresolved or use explicitly selected configuration, rather than silently selecting Classic behavior.

## Dated beta observations

| Observation | Source and build | Current decision |
|---|---|---|
| Project ID was 1 | [Kit capture](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/data/forever_api.json), build 69893 | Historical runtime evidence. Do not override the 70532 Camelot loading trace with it. |
| Secure snippets failed in early beta | [Kit report](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/README.md) reports a load-order defect and a fix in 70009 | Preserve as a dated report; retest actual snippet behavior for an addon needing it. Do not install the kit's obsolete guard script. |
| `loadstring_untainted` is nil after loading | [RestrictedExecution.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_RestrictedAddOnEnvironment/RestrictedExecution.lua) captures it locally; [EnvironmentCleanup.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_EnvironmentCleanup/Mainline/EnvironmentCleanup.lua) subsequently clears the global | Global nil is not a valid secure-snippet capability test. The [cleanup TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_EnvironmentCleanup/Blizzard_EnvironmentCleanup.toc) has an unconditional optional restricted-environment dependency at this pin. This supports the loading analysis, not a new runtime pass. |
| SavedVariables written but not restored | Early kit report; [WFG developer guide](https://wowforeverguides.com/addons/developers) records a later community report of a 70009 fix | Current persistence is not tested here. Run reload and clean restart checks before recommending a compatibility bridge. Keep addon initialization at its `ADDON_LOADED` lifecycle. |

Community reports remain build-scoped leads. A reported fix, current source change, and a fresh client reproduction are distinct evidence. Do not carry a historical workaround into release guidance merely because it remains in a repository.

## Feature references and runtime limits

- [Forever Legacy integration](../../wow-api-talents/references/FOREVER-LEGACY.md): traits, challenges, reward track, bootstrap loading and UI callbacks.
- [Combat](../../wow-api-combat/SKILL.md): damage-meter and swing-timer contracts; current source must not be confused with unrestricted addon access.
- [Runtime capture and validation](../../wow-addon-development/references/RUNTIME-VALIDATION.md): clean addon state, explicit event subscriptions, source/runtime reconciliation and release checks.

The early kit capture contains enabled-addon globals and no event/signature inventory. Its missing names cannot establish removal; generated-only names may be internal, platform-specific or loaded in another environment. Use the separate fields in the [evidence record](EVIDENCE-RECORDS.md) when updating any capability claim.
