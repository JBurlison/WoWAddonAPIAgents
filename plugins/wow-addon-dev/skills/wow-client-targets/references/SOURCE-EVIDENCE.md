# Verified source observations

These observations establish what the source says, not an in-game compatibility certificate. Inventory and version checks do not revalidate the historical domain documentation.

## retail: 12.1.5.70783

- Commit: 297d7aaaa736f346b3e036f38ee088eaf7f8c07f; interface 120105 is derived, pending in-client confirmation.
- [FrameXMLBase loading](https://github.com/Gethe/wow-ui-source/blob/297d7aaaa736f346b3e036f38ee088eaf7f8c07f/Interface/AddOns/Blizzard_FrameXMLBase/Blizzard_FrameXMLBase.toc) selects constants by family/game; a branch contains several client variants.
- [Aura definitions](https://github.com/Gethe/wow-ui-source/blob/297d7aaaa736f346b3e036f38ee088eaf7f8c07f/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitAuraDocumentation.lua) include C_UnitAuras.GetAuraDataByIndex(unit, index, filter) returning optional AuraData. Verify the structure and access annotations for the intended operation.
- [Spell definitions](https://github.com/Gethe/wow-ui-source/blob/297d7aaaa736f346b3e036f38ee088eaf7f8c07f/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua) include C_Spell.GetSpellInfo(spellIdentifier) returning SpellInfo, with a possible no-result case. Do not assume a legacy tuple API.

Reviewed 2026-11-04: 12.1.5.70688 (`d07eb002`) → 12.1.5.70783 changed only declarations plus Friends/BNet/chat UI: optional `subIcon` on a BattleNet game-account structure and title-icon texture helpers; `ApplyRolesetFilters` gains `HasRestrictions` (blocked for tainted callers in combat lockdown); `UNIT_COMBAT` `amount` is `SecretValue`. The aura and spell sources above are not in the changed list. No in-game test.

## forever: 1.60.1.70862

- Commit: 9dc84f0d3bbae1768ac3405b3716000bd93eda06; interface 16001 is derived, pending in-client confirmation.
- [FrameXMLBase loading](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_FrameXMLBase/Blizzard_FrameXMLBase.toc) selects constants by family/game; a branch contains several client variants.
- [Aura definitions](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitAuraDocumentation.lua) include C_UnitAuras.GetAuraDataByIndex(unit, index, filter) returning optional AuraData. Verify the structure and access annotations for the intended operation.
- [Spell definitions](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua) include C_Spell.GetSpellInfo(spellIdentifier) returning SpellInfo, with a possible no-result case. Do not assume a legacy tuple API.
- [ProjectConstants loading](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_ProjectConstants/Blizzard_ProjectConstants.toc) selects the [Camelot assignment](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_ProjectConstants/Camelot/ProjectConstants.lua): `WOW_PROJECT_CAMELOT = 18`, then `WOW_PROJECT_ID = WOW_PROJECT_CAMELOT`. This is a source observation; older runtime project=1 reports refer to earlier builds. See [Forever evidence and beta history](FOREVER.md).
- [Legacy loading](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_LegacySystem/Blizzard_LegacySystem.toc) is Camelot-only and load-on-demand. Its trait, achievement and renown integration is documented in [Forever Legacy](../../wow-api-talents/references/FOREVER-LEGACY.md).

Reviewed 2026-11-03 (at 1.60.1.70707): the linked identity, aura and Legacy loading sources were unchanged from 70532; the cited spell-info contract also remained unchanged. See [70707 changes](FOREVER-70707-CHANGES.md) for the nine changed API definition files, predicate-driven PvP restrictions, new events, and loaded UI helper changes. No in-game acceptance is claimed.

Reviewed 2026-11-04: 1.60.1.70707 (`aff0d8cd`) → 1.60.1.70790: none of the FrameXMLBase, ProjectConstants, Legacy, UnitAura or Spell sources is in the changed-file list, so those observations carry forward by comparison, not by re-reading every symbol. Changed declarations: new `C_ActionBar.IsHighestSpellRank(spellID)`; new `C_BattleNet.GetDefaultTitleWhisperTarget(id)`; optional `subIcon` string on title-icon texture helpers and a BattleNet game-account field; `SubscriptionInterstitialType.SubscriptionPeriod = 3`; `ApplyRolesetFilters` gains `HasRestrictions` (blocked for tainted callers in combat lockdown); `UNIT_COMBAT` `amount` is now `SecretValue`. The ActionBar TOC adds a Camelot-only `ActionButtonUtilOverrides.lua`. Declarations only; no in-game test.

Reviewed 2026-11-09: 1.60.1.70790 (`eac30af5`) → 1.60.1.70862 (`9dc84f0d`): no API-definition files changed and none of the FrameXMLBase, ProjectConstants, Legacy, UnitAura or Spell sources above is in the changed-file list, so those observations carry forward by comparison. Changed UI only: Mainline BarberShop sets `disallowGamepadUnfocus` on `BarberShopFrame` and adds a SmartNavigation jump override; the gamepad `FrameControlsManager` skips UI-unfocus when the active frame is parented to a top-level parent with that flag; SmartNavigation re-parents on the `UI.AlternateTopLevelParentChanged` EventRegistry callback; plus SocialToast, CharacterSelect and SubscriptionInterstitial UI edits. These are Blizzard-internal UI behaviours, not addon contracts; no in-game test.

## classic: 5.5.4.70631

- Commit: e5d9b3a22c3f0f6f41ebac0e454f4969594261cf; interface 50504 is derived, pending in-client confirmation.
- [FrameXMLBase loading](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_FrameXMLBase/Blizzard_FrameXMLBase.toc) selects constants by family/game; a branch contains several client variants.
- [Aura definitions](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitAuraDocumentation.lua) include C_UnitAuras.GetAuraDataByIndex(unit, index, filter) returning optional AuraData. Verify the structure and access annotations for the intended operation.
- [Spell definitions](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua) include C_Spell.GetSpellInfo(spellIdentifier) returning SpellInfo, with a possible no-result case. Do not assume a legacy tuple API.

## Differences that affect implementation

- Retail and Forever's inspected GetAuraDataByIndex definitions include RequiresUnitAuraAccess, SecretWhenUnitAuraRestricted, and SecretArguments annotations. The inspected Classic definition does not contain those same annotations. This is evidence to examine per-client access semantics, not proof that Classic data is unrestricted in every context.
- Forever's FrameXMLBase TOC explicitly selects a Camelot constants file while excluding Camelot from the family constants include. Do not equate Forever with the Vanilla/Era constants file or invent a new numeric project ID.
- Classic's Mists constants assign WOW_PROJECT_ID to WOW_PROJECT_MISTS_CLASSIC, but that file's load condition must be followed; other constants files in the same tree assign other IDs.
- Housing definitions exist in all three source inventories. Their presence alone must not enable a housing feature.

When refreshing these observations, keep their source links pinned to the same commits as the target registry and re-read the referenced definitions.
