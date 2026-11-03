# Combat contracts reviewed 2026-11-03

These are source-verified declarations and loading observations at the pins below, not in-game addon certification. Follow [client targets](../../wow-client-targets/SKILL.md) when a task requests another build. The historical combat tables do not override this reference.

| Target / build | DamageMeter definitions | Constants | Blizzard UI loading |
|---|---|---|---|
| Retail 12.1.5.70688 | [d07eb002: API](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/DamageMeterDocumentation.lua) | [Enums](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/DamageMeterConstantsDocumentation.lua) | [TOC](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_DamageMeter/Blizzard_DamageMeter.toc): `standard`; depends on `Blizzard_EditMode`. |
| Forever 1.60.1.70707 | [aff0d8cd: API](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/DamageMeterDocumentation.lua) | [Enums](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/DamageMeterConstantsDocumentation.lua) | [TOC](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_DamageMeter/Blizzard_DamageMeter.toc): `standard, camelot`; depends on `Blizzard_EditMode`; Camelot overrides. |
| Classic progression 5.5.4.70631 | [e5d9b3a2: API](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/DamageMeterDocumentation.lua) | [Enums](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/DamageMeterConstantsDocumentation.lua) | [TOC](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_DamageMeter/Blizzard_DamageMeter.toc) still selects `standard`, not Classic. Generated presence does not establish a usable Classic meter. |

All three declare the same eight methods, three events and field types below. Forever 1.60.1.70707 changes the two `specIconID` secrecy annotations; it must no longer be treated as annotation-identical to the pinned Retail build. Classic omits the secrecy annotations described below; that omission does not certify unrestricted runtime access. `Environment = "All"` does not bypass client loading, feature availability or caller restrictions. Built-in UI dependencies concern Blizzard's UI, not proof that an engine export requires loading that UI.

## C_DamageMeter

`?` means a nilable argument, return or field; it is not a default value. Arguments and multiple returns are ordered. Methods with no return list declare no returns.

| Function | Ordered arguments | Returns |
|---|---|---|
| `C_DamageMeter.GetAvailableCombatSessions` | none | `availableSessions: DamageMeterAvailableCombatSession[]` |
| `C_DamageMeter.GetCombatSessionFromID` | `sessionID: number, type: DamageMeterType` | `session: DamageMeterCombatSession` |
| `C_DamageMeter.GetCombatSessionFromType` | `sessionType: DamageMeterSessionType, type: DamageMeterType` | `session: DamageMeterCombatSession` |
| `C_DamageMeter.GetCombatSessionSourceFromID` | `sessionID: number, type: DamageMeterType, sourceGUID: WOWGUID?, sourceCreatureID: number?` | `sessionSource: DamageMeterCombatSessionSource` |
| `C_DamageMeter.GetCombatSessionSourceFromType` | `sessionType: DamageMeterSessionType, type: DamageMeterType, sourceGUID: WOWGUID?, sourceCreatureID: number?` | `sessionSource: DamageMeterCombatSessionSource` |
| `C_DamageMeter.GetSessionDurationSeconds` | `sessionType: DamageMeterSessionType` | `durationSeconds: number?` |
| `C_DamageMeter.IsDamageMeterAvailable` | none | `isAvailable: bool, failureReason: string` |
| `C_DamageMeter.ResetAllCombatSessions` | none | none |

Retail and Forever annotate the four `GetCombatSession*` queries with `SecretWhenInCombat = true` and `SecretArguments = "AllowedWhenUntainted"`. `GetSessionDurationSeconds` has the latter annotation. Do not interpret that annotation as permission for tainted addon code to pass secret inputs. The other three methods have neither annotation in the inspected definitions. Preserve returned restrictions rather than sorting, comparing, formatting or persisting secret values as ordinary data. See [access rules](../../wow-api-lua-environment/references/CURRENT-CONTRACTS.md).

| Event | Ordered payload | Delivery annotation |
|---|---|---|
| `DAMAGE_METER_COMBAT_SESSION_UPDATED` | `type: DamageMeterType, sessionID: number` | `UniqueEvent = true` |
| `DAMAGE_METER_CURRENT_SESSION_UPDATED` | none declared | `UniqueEvent = true` |
| `DAMAGE_METER_RESET` | none declared | `UniqueEvent = true` |

The updated event identifies a meter type and session ID; it does not supply session contents. A `sessionID` is not a `DamageMeterSessionType` enum. Check the selected build's actual event subscription and access before querying in a handler. The [Forever session UI](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_DamageMeter/DamageMeterSessionWindow.lua) is a loading/usage reference, not a promise that addons have the same permissions.

### Types and fields

The following fields are non-nil unless marked `?`. `number=0` records a declared default. Enum names use `Enum.<type>.<member>` at runtime.

| Structure | Fields |
|---|---|
| `DamageMeterAvailableCombatSession` | `sessionID: number`, `name: cstring`, `durationSeconds: number?` |
| `DamageMeterCombatSession` | `combatSources: DamageMeterCombatSource[]`, `maxAmount: number=0`, `totalAmount: number=0`, `durationSeconds: number?` |
| `DamageMeterCombatSessionSource` | `combatSpells: DamageMeterCombatSpell[]`, `maxAmount: number=0`, `totalAmount: number=0` |
| `DamageMeterCombatSource` | `sourceGUID: WOWGUID?`, `sourceCreatureID: number?`, `name: cstring`, `classFilename: cstring`, `specIconID: fileID`, `totalAmount: number`, `amountPerSecond: number`, `isLocalPlayer: bool`, `deathRecapID: number`, `deathTimeSeconds: number`, `classification: cstring`, `sourceDisplayType: DamageMeterSourceDisplayType`, `factionGroup: cstring?` |
| `DamageMeterCombatSpell` | `spellID: number`, `totalAmount: number`, `amountPerSecond: number`, `creatureName: cstring`, `overkillAmount: number`, `isAvoidable: bool`, `isDeadly: bool`, `combatSpellDetails: DamageMeterCombatSpellUnitDetails` |
| `DamageMeterCombatSpellUnitDetails` | `unitName: cstring`, `unitClassFilename: cstring`, `classification: cstring`, `isPet: bool`, `isMob: bool`, `amount: number`, `specIconID: fileID` |

Field annotations shared by the inspected Retail and Forever pins:

- `DamageMeterCombatSource.sourceGUID` and `.name`: `ConditionalSecret = true`.
- `DamageMeterCombatSource.classFilename`, `.isLocalPlayer`, `.deathRecapID`, `.classification`: `NeverSecret = true`.
- `DamageMeterCombatSpellUnitDetails.unitClassFilename`, `.classification`: `NeverSecret = true`.

Both structures' `specIconID` fields are `SecretValue = true` in [Forever 1.60.1.70707](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/DamageMeterDocumentation.lua#L203). The pinned Retail file still declares `NeverSecret = true`; Forever 1.60.1.70532 also used that earlier annotation. The new Forever [entry renderer](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_DamageMeter/DamageMeterEntry.lua#L54) checks whether either icon value is secret before reaching an equality comparison. Do not compare, format or use these secret icon IDs as ordinary cache keys. Any presentation path must separately satisfy the selected widget's access contract; Blizzard's code is usage evidence, not addon permission.

No such field annotations appear in the inspected Classic file. A field without `NeverSecret` is not guaranteed readable; a readable field does not make its containing object or sibling fields unrestricted.

| Enum | Members |
|---|---|
| `DamageMeterSessionType` | `Overall=0`, `Current=1`, `Expired=2` |
| `DamageMeterSourceDisplayType` | `None=0`, `Ally=1`, `Enemy=2` |
| `DamageMeterType` | `DamageDone=0`, `Dps=1`, `HealingDone=2`, `Hps=3`, `Absorbs=4`, `Interrupts=5`, `Dispels=6`, `DamageTaken=7`, `AvoidableDamageTaken=8`, `Deaths=9`, `EnemyDamageTaken=10` |

The old guide's `GetCurrentSessionID`, `GetSessions`, `GetSessionInfo`, `GetPlayerData`, `GetPartyData` and `ResetSessions` names are not supported by these reviewed declarations. Their runnable example has been withdrawn. Do not invent a one-to-one shim or infer that these names were removed from every historical client.

## Loss of control and crowd-control classification

The following signatures are present at all three pinned targets; annotations differ. [Forever loss-of-control definitions](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/LossOfControlDocumentation.lua#L11), [Retail definitions](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/LossOfControlDocumentation.lua#L11) and [Classic definitions](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/LossOfControlDocumentation.lua#L11) each declare `Environment = "All"`.

| Function | Ordered arguments | Returns |
|---|---|---|
| `C_LossOfControl.GetActiveLossOfControlData` | `index: luaIndex` | `event: LossOfControlData?` |
| `C_LossOfControl.GetActiveLossOfControlDataByUnit` | `unitToken: UnitToken, index: luaIndex` | `event: LossOfControlData?` |

In Forever 1.60.1.70707 both getters have `SecretWhenLossOfControlRestricted = true` and `SecretArguments = "AllowedWhenUntainted"`. The [new predicate](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/SecretPredicatesDocumentation.lua#L100) describes secret results except when the active player is an active PvP spectator or commentator. It has no ordinary-player or out-of-combat exception. This is an annotation, not a callable Lua function. A nullable result still requires a no-result case; a returned record does not make its fields safe for arbitrary inspection. `LossOfControlData.priority` and `.displayType` retain their explicit `NeverSecret` annotations in the Forever declaration.

The older `SecretWhenLossOfControlInfoRestricted` predicate remains declared, but its [Forever prose](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/SecretPredicatesDocumentation.lua#L105) now has the same spectator/commentator exception and no active-player exemption. This also affects its existing consumers: [C_PvP.GetArenaCrowdControlInfo](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/PvpInfoDocumentation.lua#L169) and [ARENA_CROWD_CONTROL_SPELL_UPDATE](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitDocumentation.lua#L3535), even though those declaration files did not change in this update.

At the pinned Retail build, the first getter has no `SecretWhenLossOfControl*` annotation and the unit getter retains `SecretWhenLossOfControlInfoRestricted`; both have `AllowedWhenUntainted`. Retail's [predicate prose](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/SecretPredicatesDocumentation.lua#L100) still excludes the active-player subject from its secrecy condition. Neither getter has these secrecy annotations in the inspected Classic file. These source differences do not certify general access in any client, and the older Retail rule must not be copied into current Forever code.

`C_Spell.IsSpellCrowdControl(spellIdentifier: SpellIdentifier) -> isCrowdControl: bool` keeps its signature. Its `SecretArguments` changes from `AllowedWhenTainted` in Forever 1.60.1.70532 to [`AllowedWhenUntainted` in 1.60.1.70707](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua#L853). The [pinned Retail declaration](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua#L784) still has `AllowedWhenTainted`; [Classic](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua#L526) has no `SecretArguments` annotation. Do not pass a secret aura spell identifier from tainted addon code based on the older Forever/Retail rule, or infer from this input restriction alone that every return value is secret.

For loading evidence, Forever's [FrameXML TOC](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_FrameXML/Blizzard_FrameXML.toc#L135) lists the loss-of-control frame under `mists, mainline` conditions, while its [nameplate TOC](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_NamePlates/Blizzard_NamePlates.toc#L10) directly includes `Blizzard_NamePlateAuras.lua` alongside Camelot-specific overrides. That [implementation](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_NamePlates/Blizzard_NamePlateAuras.lua#L176) uses both spell classification and the unit loss-of-control getter. These paths document Blizzard UI selection and use; they do not establish addon access or prove a particular client session loaded them.

## Forever swing timers

Only Forever's inspected tree declares this system; the Retail/Classic generated inventories do not. Treat those other targets as unresolved for this capability rather than asserting universal removal. [SwingTimer definitions and enum](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_APIDocumentationGenerated/SwingTimerDocumentation.lua) specify `Environment = "All"` and `SecretArguments = "AllowedWhenUntainted"` on both functions.

| Function | Ordered arguments | Returns / behavior |
|---|---|---|
| `C_SwingTimer.EnableRangeCheck` | `swingType: PlayerSwingType, enable: bool` | No returns. Enables/disables range-change notifications for that swing type. |
| `C_SwingTimer.IsTargetWithinSwingRange` | `swingType: PlayerSwingType` | `isInRange: bool?`; queries the current target only. Nil means no valid check, such as no attackable target or no appropriate weapon; it does not mean out of range. |

| Event | Ordered payload | Delivery annotation |
|---|---|---|
| `PLAYER_SWING` | `swingDuration: number, swingType: PlayerSwingType` | `SynchronousEvent = true` |
| `PLAYER_SWING_RANGE_UPDATE` | `swingType: PlayerSwingType, isInRange: bool, checksRange: bool` | `SynchronousEvent = true`; signaled only for swing types with an active range check. |

`Enum.PlayerSwingType` is `MainHand=0`, `OffHand=1`, `Ranged=2`. Disregard `isInRange` when `checksRange` is false. `PLAYER_SWING` and the range event have different first arguments; do not reuse one unpacking order for both.

The [SwingTimer TOC](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_SwingTimer/Blizzard_SwingTimer.toc) selects `camelot` and depends on `Blizzard_EditMode` and `Blizzard_ManagedFrameSystem`. [Blizzard's implementation](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_SwingTimer/Blizzard_SwingTimer.lua#L142) demonstrates payload order; its range-state update uses an explicit `== false` check so nil is not classified as out of range. The functions, enum, events and TOC are unchanged from Forever 1.60.1.70532 and were rechecked at 1.60.1.70707. The newer UI also [handles player UNIT_INVENTORY_CHANGED](https://github.com/Gethe/wow-ui-source/blob/aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16/Interface/AddOns/Blizzard_SwingTimer/Blizzard_SwingTimer.lua#L157) as a workaround for unreliable weapon-slot notifications on entering the world; this is a source-observed implementation change, not a tested fix. Enable range updates only while needed and disable that subscription when the consumer stops. Follow the selected client's access rules before adopting Blizzard's branching code in an addon.

## Client acceptance still required

Record actual addon access to meter queries/events, loss-of-control getters, crowd-control classification and swing functions in a clean target client. Include combat and instance contexts, player versus other-unit loss of control, normal versus legitimately available spectator/commentator contexts, disabled-meter behavior, no/invalid target, weapon changes and subscription teardown. Test permitted presentation paths with secrets kept opaque, including the meter's secret specialization icons. No runtime scenario in this reference has been executed by this review.
