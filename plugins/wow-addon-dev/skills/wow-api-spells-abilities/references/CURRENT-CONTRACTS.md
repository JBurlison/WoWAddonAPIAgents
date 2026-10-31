# Cooldown contracts reviewed 2026-10-31

These contracts supersede the historical seconds-based duration descriptions and empty `SPELL_UPDATE_COOLDOWN` payload entries. They describe pinned source, not tested addon access. Other spell APIs in the historical references still require independent verification.

| Target / build | Spell declarations | SpellBook events | Cooldown widget |
|---|---|---|---|
| Retail 12.1.5.70688 | [d07eb002: Spell](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua) | [SpellBook](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellBookDocumentation.lua) | [FrameAPICooldown](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/FrameAPICooldownDocumentation.lua) |
| Forever 1.60.1.70532 | [ca8368f2: Spell](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua) | [SpellBook](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellBookDocumentation.lua) | [FrameAPICooldown](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/FrameAPICooldownDocumentation.lua) |
| Classic progression 5.5.4.70631 | [e5d9b3a2: Spell](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua) | [SpellBook](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellBookDocumentation.lua) | [FrameAPICooldown](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/FrameAPICooldownDocumentation.lua) |

## Duration objects

All three inspected Spell systems declare `Environment = "All"` and these same signatures:

| Function | Ordered arguments | Return |
|---|---|---|
| `C_Spell.GetSpellCooldownDuration` | `spellIdentifier: SpellIdentifier, ignoreGCD: bool=false` | `duration: LuaDurationObject` when returned |
| `C_Spell.GetSpellChargeDuration` | `spellIdentifier: SpellIdentifier` | `duration: LuaDurationObject` when returned |
| `C_Spell.GetSpellLossOfControlCooldownDuration` | `spellIdentifier: SpellIdentifier` | `duration: LuaDurationObject` when returned |

Each has `MayReturnNothing = true`. The return entry itself is non-nilable when a result is returned; callers must still handle the no-result case. These APIs return objects describing active cooldown/recharge intervals, not a numeric count of remaining seconds. Do not perform arithmetic, `tonumber`, formatting or numeric comparison on the object. `ignoreGCD` defaults to false; omitting it differs from requesting true.

Retail and Forever annotate all three with `SecretArguments = "AllowedWhenTainted"`. Classic's inspected definitions omit that annotation. This annotation addresses arguments; it does not grant permission to inspect secret state held by a returned object. Verify object methods and their restrictions separately before using them.

The declared presentation method is `Cooldown:SetCooldownFromDurationObject(duration: LuaDurationObject, clearIfZero: bool=true)`. Retail/Forever annotate it `IsProtectedFunction = true` and `SecretArguments = "AllowedWhenUntainted"`; Classic has neither annotation on this method. Use only a widget/calling context where the operation is permitted. Do not claim that every addon can invoke a Blizzard display path with arbitrary secret inputs. The source declarations do not require loading Blizzard's spellbook UI, but existing widgets/templates may have their own owners and dependencies.

## SPELL_UPDATE_COOLDOWN

All three events have `UniqueEvent = true`. Their payloads differ:

| Target | Ordered payload |
|---|---|
| Retail and Forever | `spellID: number?, baseSpellID: number?, category: number?, startRecoveryCategory: number?, itemID: number?` |
| Classic progression | `spellID: number?, baseSpellID: number?, category: number?, startRecoveryCategory: number?` |

All listed fields are nilable. A nil `spellID` requests updating all cooldowns; otherwise it may be a base or override spell. `baseSpellID` is populated for an override. A nil `category` or `startRecoveryCategory` means no associated category in that field. Retail/Forever may additionally identify an associated item with `itemID`; Classic declares no fifth field at this pin.

An event handler must tolerate nil arguments rather than interpret them as zero. Keep the target-specific schema in one adapter or use a handler that deliberately accepts the four common fields and the optional fifth field without promising it exists on Classic. Do not infer that the event fires once per cast or carries the cooldown interval itself.

## Client checks still required

Validate querying and presenting a normal cooldown, GCD-only behavior with both `ignoreGCD` values, charge recharge, loss of control, an invalid/unavailable spell, and cooldown events for override spells and full refreshes. Record actual client build and widget/caller context, including combat/instance restrictions. This review did not run those scenarios in a game client.
