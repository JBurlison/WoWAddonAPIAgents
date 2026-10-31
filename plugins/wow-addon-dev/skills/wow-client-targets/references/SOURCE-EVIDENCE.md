# Verified source observations

These observations establish what the source says, not an in-game compatibility certificate. Inventory and version checks do not revalidate the historical domain documentation.

## retail: 12.1.5.70688

- Commit: d07eb00237d8891f153215db98a5df880a26cfe5; interface 120105 is derived, pending in-client confirmation.
- [FrameXMLBase loading](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_FrameXMLBase/Blizzard_FrameXMLBase.toc) selects constants by family/game; a branch contains several client variants.
- [Aura definitions](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitAuraDocumentation.lua) include C_UnitAuras.GetAuraDataByIndex(unit, index, filter) returning optional AuraData. Verify the structure and access annotations for the intended operation.
- [Spell definitions](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua) include C_Spell.GetSpellInfo(spellIdentifier) returning SpellInfo, with a possible no-result case. Do not assume a legacy tuple API.

## forever: 1.60.1.70532

- Commit: ca8368f2f2380cbe696854f7f2646387c278a61b; interface 16001 is derived, pending in-client confirmation.
- [FrameXMLBase loading](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_FrameXMLBase/Blizzard_FrameXMLBase.toc) selects constants by family/game; a branch contains several client variants.
- [Aura definitions](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitAuraDocumentation.lua) include C_UnitAuras.GetAuraDataByIndex(unit, index, filter) returning optional AuraData. Verify the structure and access annotations for the intended operation.
- [Spell definitions](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellDocumentation.lua) include C_Spell.GetSpellInfo(spellIdentifier) returning SpellInfo, with a possible no-result case. Do not assume a legacy tuple API.

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
