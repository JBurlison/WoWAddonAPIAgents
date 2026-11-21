# Generated API coverage audit

Audit date: 2026-11-21. This is a source-inventory and lexical-mention audit, **not** a compatibility certificate or a claim that a mentioned symbol has a correct signature, payload, restriction description, or example.

The denominator includes every generated documentation Lua file, including shared and client-conditional systems. An absent generated definition does not establish removal; a present definition does not establish that addons can call it or subscribe to it. Runtime captures, FrameXML/global helpers, macro commands, CVars, XML attributes, and handwritten code are separate audit surfaces.

## Inventory and gaps

| Target | Version / pinned source | C_ namespaces (unrouted / no mention) | Functions: total / no mention | Events: total / no mention | Object methods: total / no method-name mention |
|---|---|---:|---:|---:|---:|
| retail | [12.1.5.70783](https://github.com/Gethe/wow-ui-source/tree/297d7aaaa736f346b3e036f38ee088eaf7f8c07f) | 273 (0 / 129) | 4970 / 3442 | 1784 / 1332 | 1470 / 866 |
| forever | [1.60.1.70938](https://github.com/Gethe/wow-ui-source/tree/bebcb6bf309cf41b41bd74f8ca651e6a105b2676) | 283 (0 / 135) | 5145 / 3597 | 1816 / 1359 | 1477 / 873 |
| classic | [5.5.4.70631](https://github.com/Gethe/wow-ui-source/tree/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf) | 220 (0 / 98) | 3231 / 2199 | 1483 / 1068 | 1360 / 782 |

Event totals include definitions marked CallbackEvent: retail 12, forever 12, classic 8. These must be distinguished from frame-event subscriptions. The scanner honors per-function Namespace (including explicit global exports) and Environment overrides, retains the original source system, and rejects duplicate qualified symbols.

Counts distinguish global and namespaced functions from generated ScriptObject methods. Method matching is deliberately weaker: any `.Method` or `:Method` mention is credited, without validating its object type. A zero gap in that column is not object coverage. The JSON contains per-symbol arguments/returns or event payload names/types, nilability/defaults where present, scalar annotations, source lines, and owner-route/mention flags; these extracted fields are an audit aid, not a replacement for full upstream structures or semantics. Table-valued annotations and type definitions require opening the linked source. `Environment` is retained (All or SecureOnly in these inventories); neither value proves addon-facing availability.

## Reproduce

Use Node.js 22+. Clone `Gethe/wow-ui-source` into ignored `.cache/api-audit/retail`, `forever`, and `classic`; check out the commits in `skills/wow-client-targets/references/targets.json`, then run:

```sh
node scripts/audit-api-coverage.mjs
node --test test/audit-api-coverage.test.mjs
```

The scanner rejects dirty or mismatched source checkouts, ignores Lua strings/comments when reading table structure, and checks that every generated Function/Event table was extracted. It does not execute upstream Lua or require additional packages. These source trees stay ignored and are not packaged.

Corpus: handwritten Markdown in the 39 maintained `skills/wow-*` directories. Generated ledgers, package copies and audit reports are excluded. Namespaced functions need an exact `Namespace.Member` token; global functions and event literal names need an exact identifier. Bare method listings under namespace headings can therefore appear missing and require manual review. This is a lexical screening metric, not a percentage of correctly documented APIs. Owner routes come only from the current namespace lookup; unassigned rows need a deliberate domain decision.

The JSON uses `recordColumns` and `parameterColumns` to describe compact row arrays. `sourceFile` indexes that target's `sourceFiles`; combine it with `sourceBasePath`, the target commit, and row line to reconstruct a pinned GitHub link. Group owner/route metadata is in `groups`.

## Namespace matrix

Each cell is **functions with no exact mention / generated functions**. Event columns are **events with no mention / generated events**. `—` means no such generated group in that source inventory; it does not mean unsupported. Prioritize source/load-condition review before filling unverified features.

| Namespace | Current routed skill | Namespace mentioned? | Retail functions | Forever functions | Classic functions | Forever events |
|---|---|---|---:|---:|---:|---:|
| `C_AccessibilityOptions` | wow-api-settings-system | yes | 0 / 0 | 0 / 0 | — | 0 / 0 |
| `C_AccountInfo` | wow-api-settings-system | **no** | 3 / 3 | 3 / 3 | 3 / 3 | 0 / 0 |
| `C_AccountStore` | wow-api-currency-economy | **no** | 11 / 11 | 11 / 11 | 11 / 11 | 5 / 5 |
| `C_AchievementInfo` | wow-api-achievements | yes | 6 / 6 | 6 / 6 | 6 / 6 | 2 / 11 |
| `C_AchievementTelemetry` | wow-api-achievements | **no** | 3 / 3 | 3 / 3 | 3 / 3 | 0 / 0 |
| `C_ActionBar` | wow-api-spells-abilities | yes | 3 / 71 | 4 / 73 | 2 / 63 | 6 / 15 |
| `C_AddOnProfiler` | wow-addon-structure | yes | 10 / 10 | 10 / 10 | 10 / 10 | 0 / 0 |
| `C_AddOns` | wow-addon-structure | yes | 0 / 29 | 0 / 29 | 0 / 29 | 0 / 3 |
| `C_AdventureJournal` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 14 / 14 |
| `C_AdventureMap` | wow-api-quests | **no** | 5 / 5 | 5 / 5 | 0 / 0 | 5 / 5 |
| `C_AlliedRaces` | wow-api-misc-systems | yes | 1 / 2 | 1 / 2 | — | 2 / 2 |
| `C_AnimaDiversion` | wow-api-misc-systems | **no** | 7 / 7 | 7 / 7 | — | 3 / 3 |
| `C_ArdenwealdGardening` | wow-api-misc-systems | **no** | 2 / 2 | 2 / 2 | — | 0 / 0 |
| `C_AreaPoiInfo` | wow-api-map-navigation | yes | 4 / 8 | 4 / 8 | 1 / 4 | 0 / 1 |
| `C_ArtifactUI` | wow-api-items-inventory | **no** | 62 / 62 | 62 / 62 | — | 10 / 10 |
| `C_AssistedCombat` | wow-api-spells-abilities | yes | 0 / 4 | 0 / 4 | 0 / 4 | 1 / 1 |
| `C_AuctionHouse` | wow-api-currency-economy | yes | 52 / 85 | 53 / 86 | 52 / 85 | 38 / 47 |
| `C_AuraContainerUtil` | wow-api-unit-player | **no** | 10 / 10 | 10 / 10 | — | 0 / 0 |
| `C_AutoComplete` | wow-api-social-chat | **no** | 4 / 4 | 4 / 4 | 4 / 4 | 0 / 0 |
| `C_AutoLoot` | wow-api-items-inventory | **no** | — | 1 / 1 | — | 0 / 0 |
| `C_AzeriteEmpoweredItem` | wow-api-items-inventory | yes | 16 / 18 | 16 / 18 | 16 / 18 | 2 / 2 |
| `C_AzeriteEssence` | wow-api-items-inventory | **no** | 21 / 21 | 21 / 21 | 21 / 21 | 8 / 8 |
| `C_AzeriteItem` | wow-api-items-inventory | yes | 7 / 10 | 7 / 10 | 7 / 10 | 3 / 3 |
| `C_Bank` | wow-api-items-inventory | yes | 0 / 23 | 3 / 26 | 0 / 0 | 4 / 7 |
| `C_BarberShop` | wow-api-transmog | yes | 16 / 29 | 16 / 29 | 21 / 32 | 2 / 7 |
| `C_BarberShopInternal` | wow-api-transmog | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0 |
| `C_BattleNet` | wow-api-social-chat | yes | 23 / 30 | 28 / 36 | 11 / 18 | 0 / 0 |
| `C_BattlePet` | wow-api-collections | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 20 / 26 |
| `C_BehavioralMessaging` | wow-api-misc-systems | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| `C_BlackMarketInfo` | wow-api-currency-economy | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 5 / 7 |
| `C_BlizzCon2026` | wow-api-misc-systems | **no** | — | 4 / 4 | — | 2 / 2 |
| `C_Browser` | wow-api-misc-systems | **no** | 1 / 1 | 1 / 1 | 0 / 0 | 7 / 7 |
| `C_CVar` | wow-api-settings-system | yes | 0 / 10 | 0 / 12 | 0 / 9 | 0 / 0 |
| `C_Calendar` | wow-api-calendar-events | yes | 47 / 90 | 47 / 90 | 47 / 90 | 2 / 13 |
| `C_CampaignInfo` | wow-api-quests | yes | 3 / 10 | 3 / 10 | — | 0 / 0 |
| `C_CatalogShop` | wow-api-currency-economy | **no** | 38 / 38 | 38 / 38 | 38 / 38 | 18 / 18 |
| `C_ChallengeMode` | wow-api-encounters | yes | 16 / 29 | 16 / 29 | 14 / 20 | 8 / 14 |
| `C_ChatBubbles` | wow-api-social-chat | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0 |
| `C_ChatInfo` | wow-api-social-chat | yes | 23 / 45 | 23 / 45 | 18 / 34 | 83 / 102 |
| `C_ChromieTime` | wow-api-misc-systems | **no** | 4 / 4 | 4 / 4 | — | 0 / 0 |
| `C_CinematicList` | wow-api-misc-systems | **no** | 1 / 1 | 1 / 1 | — | 0 / 0 |
| `C_ClassColor` | wow-api-widget | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0 |
| `C_ClassTalents` | wow-api-talents | yes | 13 / 31 | 13 / 31 | — | 5 / 8 |
| `C_ClassTrial` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 2 / 2 |
| `C_ClickBindings` | wow-api-settings-system | yes | 7 / 9 | 7 / 9 | — | 1 / 1 |
| `C_ClientScene` | wow-api-widget | **no** | 1 / 1 | 1 / 1 | 0 / 0 | 2 / 2 |
| `C_Club` | wow-api-social-chat | yes | 59 / 84 | 59 / 84 | 58 / 83 | 23 / 30 |
| `C_ClubFinder` | wow-api-social-chat | yes | 47 / 55 | 47 / 55 | 47 / 55 | 15 / 15 |
| `C_ColorOverrides` | wow-api-widget | **no** | 6 / 6 | 6 / 6 | 0 / 0 | 2 / 2 |
| `C_ColorUtil` | wow-api-widget | **no** | 7 / 7 | 7 / 7 | 7 / 7 | 0 / 0 |
| `C_CombatAudioAlert` | wow-api-combat | yes | 15 / 16 | 15 / 16 | 15 / 16 | 0 / 0 |
| `C_CombatLog` | wow-api-combat | **no** | 11 / 11 | 11 / 11 | 17 / 17 | 0 / 4 |
| `C_CombatLogInternal` | wow-api-combat | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 1 |
| `C_CombatLogSecure` | wow-api-combat | **no** | 9 / 9 | 9 / 9 | 9 / 9 | 0 / 3 |
| `C_CombatText` | wow-api-combat | yes | 3 / 3 | 3 / 3 | 3 / 3 | 1 / 1 |
| `C_Commentator` | wow-api-combat | yes | 139 / 144 | 139 / 144 | 129 / 134 | 9 / 10 |
| `C_CompactUnitFrames` | wow-api-unit-player | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 1 |
| `C_ConfigurationWarnings` | wow-api-settings-system | **no** | 4 / 4 | 4 / 4 | 4 / 4 | 0 / 0 |
| `C_ConsoleScriptCollection` | wow-api-misc-systems | **no** | 4 / 4 | 4 / 4 | 4 / 4 | 0 / 0 |
| `C_Container` | wow-api-items-inventory | yes | 8 / 47 | 8 / 47 | 7 / 32 | 12 / 17 |
| `C_ContentTracking` | wow-api-quests | yes | 12 / 18 | 12 / 18 | — | 5 / 5 |
| `C_ContributionCollector` | wow-api-reputation | yes | 15 / 18 | 15 / 18 | 0 / 0 | 4 / 4 |
| `C_CooldownViewer` | wow-api-spells-abilities | yes | 1 / 7 | 1 / 7 | 0 / 6 | 3 / 3 |
| `C_CovenantCallings` | wow-api-misc-systems | **no** | 2 / 2 | 2 / 2 | — | 1 / 1 |
| `C_CovenantPreview` | wow-api-misc-systems | **no** | 2 / 2 | 2 / 2 | — | 2 / 2 |
| `C_CovenantSanctumUI` | wow-api-misc-systems | **no** | 16 / 16 | 16 / 16 | — | 2 / 2 |
| `C_Covenants` | wow-api-misc-systems | yes | 1 / 3 | 1 / 3 | — | 1 / 1 |
| `C_CraftInfo` | wow-api-professions | **no** | — | — | 0 / 0 | — |
| `C_CraftingOrders` | wow-api-professions | yes | 18 / 36 | 18 / 36 | — | 15 / 24 |
| `C_CreatureInfo` | wow-api-unit-player | **no** | 8 / 8 | 8 / 8 | 8 / 8 | 0 / 0 |
| `C_CurrencyInfo` | wow-api-currency-economy | yes | 32 / 43 | 32 / 43 | 6 / 9 | 6 / 8 |
| `C_Cursor` | wow-api-misc-systems | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 4 / 4 |
| `C_CursorUtil` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| `C_CurveUtil` | wow-api-widget | yes | 3 / 5 | 3 / 5 | 3 / 5 | 0 / 0 |
| `C_DamageMeter` | wow-api-combat | yes | 0 / 8 | 0 / 8 | 0 / 8 | 0 / 3 |
| `C_DateAndTime` | wow-api-settings-system | yes | 9 / 10 | 10 / 11 | 7 / 8 | 1 / 1 |
| `C_DeathAlert` | wow-api-unit-player | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 1 |
| `C_DeathInfo` | wow-api-unit-player | **no** | 5 / 5 | 5 / 5 | 5 / 5 | 6 / 14 |
| `C_DeathRecap` | wow-api-unit-player | **no** | 4 / 4 | 4 / 4 | 4 / 4 | 0 / 0 |
| `C_DelvesUI` | wow-api-encounters | **no** | 40 / 40 | 40 / 40 | — | 6 / 6 |
| `C_Discord` | wow-api-social-chat | **no** | 20 / 20 | 21 / 21 | — | 6 / 6 |
| `C_DuelInfo` | wow-api-pvp | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 5 |
| `C_DurationUtil` | wow-api-widget | yes | 2 / 3 | 2 / 3 | 2 / 3 | 0 / 0 |
| `C_DyeColor` | wow-api-transmog | yes | 8 / 8 | 8 / 8 | 8 / 8 | 2 / 2 |
| `C_EditMode` | wow-api-widget | yes | 10 / 11 | 11 / 12 | 10 / 11 | 1 / 1 |
| `C_EncodingUtil` | wow-lua-api | yes | 10 / 10 | 10 / 10 | 10 / 10 | 0 / 0 |
| `C_EncounterEvents` | wow-api-encounters | **no** | 8 / 8 | 8 / 8 | 8 / 8 | 0 / 0 |
| `C_EncounterInfo` | wow-api-encounters | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 5 / 10 |
| `C_EncounterJournal` | wow-api-encounters | yes | 22 / 22 | 22 / 22 | 14 / 14 | 1 / 3 |
| `C_EncounterTimeline` | wow-api-encounters | **no** | 34 / 34 | 34 / 34 | 34 / 34 | 11 / 11 |
| `C_EncounterWarnings` | wow-api-encounters | **no** | 10 / 10 | 10 / 10 | 10 / 10 | 0 / 1 |
| `C_EndOfMatchUI` | wow-api-pvp | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| `C_Engraving` | wow-api-items-inventory | **no** | — | — | 26 / 26 | — |
| `C_EquipmentSet` | wow-api-items-inventory | yes | 11 / 23 | 11 / 23 | 11 / 23 | 2 / 4 |
| `C_EventScheduler` | wow-api-calendar-events | yes | 10 / 11 | 10 / 11 | 0 / 0 | 1 / 1 |
| `C_EventToastManager` | wow-api-widget | **no** | 3 / 3 | 3 / 3 | 3 / 3 | 2 / 2 |
| `C_EventUtils` | wow-api-events | yes | 0 / 2 | 0 / 2 | 0 / 2 | 0 / 0 |
| `C_ExpansionTrial` | wow-api-misc-systems | **no** | 2 / 2 | 2 / 2 | — | 0 / 0 |
| `C_ExternalEventURL` | wow-api-misc-systems | **no** | 3 / 3 | 4 / 4 | 3 / 3 | 2 / 2 |
| `C_Flyout` | wow-api-spells-abilities | **no** | — | 6 / 6 | — | 0 / 0 |
| `C_FogOfWar` | wow-api-map-navigation | yes | 0 / 2 | 0 / 2 | 0 / 0 | 1 / 1 |
| `C_FrameManager` | wow-api-widget | **no** | 1 / 1 | 1 / 1 | — | 2 / 2 |
| `C_FriendList` | wow-api-social-chat | yes | 15 / 31 | 16 / 32 | 14 / 30 | 22 / 27 |
| `C_GMTicketInfo` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 8 / 8 |
| `C_GamePad` | wow-api-settings-system | yes | 20 / 23 | 20 / 25 | 20 / 23 | 5 / 6 |
| `C_GameRules` | wow-api-settings-system | yes | 0 / 22 | 0 / 30 | 0 / 24 | 0 / 7 |
| `C_GamepadTargeting` | wow-api-settings-system | yes | — | 3 / 3 | — | 0 / 0 |
| `C_GamepadUI` | wow-api-settings-system | yes | — | 5 / 5 | — | 2 / 2 |
| `C_Garrison` | wow-api-misc-systems | yes | 40 / 40 | 40 / 40 | — | 64 / 65 |
| `C_GenericWidgetDisplay` | wow-api-widget | **no** | 2 / 2 | 2 / 2 | 2 / 2 | 1 / 1 |
| `C_Glue` | wow-api-misc-systems | **no** | 2 / 2 | 2 / 2 | 2 / 2 | 1 / 1 |
| `C_GlyphInfo` | wow-api-talents | **no** | 0 / 0 | 0 / 0 | 2 / 2 | 3 / 3 |
| `C_GossipInfo` | wow-api-quests | yes | 4 / 20 | 4 / 20 | 3 / 18 | 4 / 7 |
| `C_GuildBank` | wow-api-guild | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 2 / 10 |
| `C_GuildInfo` | wow-api-guild | yes | 20 / 35 | 24 / 39 | 19 / 34 | 24 / 33 |
| `C_HeirloomInfo` | wow-api-collections | yes | 7 / 7 | 8 / 8 | 0 / 0 | 0 / 2 |
| `C_HouseEditor` | wow-api-housing | yes | 9 / 10 | 9 / 10 | 8 / 9 | 3 / 3 |
| `C_HouseExterior` | wow-api-housing | **no** | 20 / 20 | 20 / 20 | 20 / 20 | 12 / 12 |
| `C_Housing` | wow-api-housing | yes | 59 / 62 | 59 / 62 | 55 / 58 | 39 / 39 |
| `C_HousingBasicMode` | wow-api-housing | **no** | 22 / 22 | 22 / 22 | 22 / 22 | 6 / 6 |
| `C_HousingBlueprint` | wow-api-housing | **no** | 19 / 19 | 19 / 19 | — | 14 / 14 |
| `C_HousingCatalog` | wow-api-housing | yes | 34 / 34 | 34 / 34 | 34 / 34 | 8 / 8 |
| `C_HousingCleanupMode` | wow-api-housing | **no** | 3 / 3 | 3 / 3 | 3 / 3 | 2 / 2 |
| `C_HousingCustomizeMode` | wow-api-housing | **no** | 32 / 32 | 32 / 32 | 30 / 30 | 6 / 6 |
| `C_HousingDecor` | wow-api-housing | **no** | 35 / 35 | 35 / 35 | 28 / 28 | 11 / 11 |
| `C_HousingExpertMode` | wow-api-housing | **no** | 18 / 18 | 18 / 18 | 18 / 18 | 6 / 6 |
| `C_HousingInspectMode` | wow-api-housing | **no** | 5 / 5 | 5 / 5 | 5 / 5 | 2 / 2 |
| `C_HousingLayout` | wow-api-housing | **no** | 41 / 41 | 41 / 41 | 35 / 35 | 18 / 18 |
| `C_HousingNeighborhood` | wow-api-housing | yes | 30 / 30 | 30 / 30 | 30 / 30 | 13 / 13 |
| `C_ImmersiveInteraction` | wow-api-misc-systems | yes | 1 / 1 | 1 / 1 | 1 / 1 | 2 / 2 |
| `C_IncomingSummon` | wow-api-unit-player | yes | 0 / 2 | 0 / 2 | 0 / 2 | 0 / 0 |
| `C_InputInterfaceStyle` | wow-api-settings-system | yes | — | 0 / 1 | — | 0 / 0 |
| `C_InstanceEncounter` | wow-api-encounters | **no** | 4 / 4 | 4 / 4 | 4 / 4 | 5 / 6 |
| `C_InstanceLeaver` | wow-api-encounters | **no** | 1 / 1 | 1 / 1 | — | 1 / 1 |
| `C_InterfaceFileManifest` | wow-addon-structure | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0 |
| `C_Intl` | wow-lua-api | **no** | 27 / 27 | 27 / 27 | — | 0 / 0 |
| `C_InvasionInfo` | wow-api-misc-systems | **no** | 4 / 4 | 4 / 4 | — | 0 / 0 |
| `C_IslandsInfo` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | — | 1 / 1 |
| `C_IslandsQueue` | wow-api-misc-systems | **no** | 6 / 6 | 6 / 6 | — | 2 / 2 |
| `C_Item` | wow-api-items-inventory | yes | 64 / 118 | 67 / 121 | 37 / 80 | 18 / 19 |
| `C_ItemInteraction` | wow-api-items-inventory | yes | 2 / 10 | 2 / 10 | — | 2 / 2 |
| `C_ItemSocketInfo` | wow-api-items-inventory | yes | 0 / 16 | 0 / 16 | 0 / 14 | 6 / 8 |
| `C_ItemText` | wow-api-items-inventory | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 4 / 4 |
| `C_ItemUpgrade` | wow-api-items-inventory | **no** | 16 / 16 | 16 / 16 | 9 / 9 | 3 / 3 |
| `C_KeyBindings` | wow-api-settings-system | yes | 9 / 11 | 9 / 11 | 9 / 11 | 4 / 4 |
| `C_LFGInfo` | wow-api-group-lfg | yes | 17 / 23 | 17 / 23 | 10 / 16 | 25 / 31 |
| `C_LFGList` | wow-api-group-lfg | yes | 40 / 52 | 40 / 52 | 29 / 41 | 11 / 17 |
| `C_LFGListRoles` | wow-api-group-lfg | **no** | — | 3 / 3 | 3 / 3 | 1 / 1 |
| `C_LegendaryCrafting` | wow-api-professions | **no** | 20 / 20 | 20 / 20 | — | 4 / 4 |
| `C_LevelLink` | wow-api-unit-player | yes | 0 / 2 | 0 / 2 | — | 0 / 0 |
| `C_LevelSquish` | wow-api-unit-player | **no** | 2 / 2 | 2 / 2 | — | 0 / 0 |
| `C_LimitedInput` | wow-api-lua-environment | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0 |
| `C_LiveEvent` | wow-api-misc-systems | **no** | 2 / 2 | 2 / 2 | — | 0 / 0 |
| `C_LoadingScreen` | wow-api-settings-system | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 2 / 2 |
| `C_LobbyMatchmakerInfo` | wow-api-group-lfg | yes | 8 / 8 | 8 / 8 | 1 / 1 | 5 / 5 |
| `C_Log` | wow-api-misc-systems | yes | 0 / 4 | 0 / 4 | 0 / 4 | 0 / 0 |
| `C_Loot` | wow-api-items-inventory | yes | 0 / 2 | 0 / 2 | 0 / 1 | 31 / 37 |
| `C_LootFrame` | wow-api-items-inventory | **no** | — | 1 / 1 | — | 0 / 0 |
| `C_LootHistory` | wow-api-items-inventory | **no** | 5 / 5 | 5 / 5 | — | 5 / 5 |
| `C_LootJournal` | wow-api-items-inventory | **no** | 2 / 2 | 2 / 2 | — | 1 / 1 |
| `C_LoreText` | wow-api-misc-systems | **no** | 1 / 1 | 1 / 1 | — | 1 / 1 |
| `C_LossOfControl` | wow-api-combat | yes | 1 / 5 | 1 / 5 | 1 / 5 | 4 / 6 |
| `C_MacOptions` | wow-api-settings-system | **no** | 10 / 10 | 10 / 10 | 10 / 10 | 0 / 0 |
| `C_Macro` | wow-macro-commands | **no** | 4 / 4 | 4 / 4 | 5 / 5 | 1 / 1 |
| `C_Mail` | wow-api-currency-economy | **no** | 5 / 5 | 5 / 5 | 2 / 2 | 10 / 14 |
| `C_MajorFactions` | wow-api-reputation | yes | 4 / 12 | 6 / 14 | — | 2 / 4 |
| `C_Map` | wow-api-map-navigation | yes | 8 / 40 | 8 / 40 | 3 / 25 | 2 / 7 |
| `C_MapExplorationInfo` | wow-api-map-navigation | yes | 0 / 2 | 0 / 2 | 0 / 2 | 0 / 1 |
| `C_MerchantFrame` | wow-api-items-inventory | yes | 6 / 7 | 6 / 7 | 1 / 1 | 1 / 4 |
| `C_Minimap` | wow-api-map-navigation | **no** | 23 / 23 | 23 / 23 | 5 / 5 | 4 / 4 |
| `C_ModelInfo` | wow-api-widget | yes | 3 / 8 | 3 / 8 | 3 / 8 | 1 / 1 |
| `C_ModifiedInstance` | wow-api-encounters | **no** | 1 / 1 | 1 / 1 | — | 0 / 0 |
| `C_MountJournal` | wow-api-collections | yes | 23 / 48 | 25 / 50 | 20 / 42 | 1 / 4 |
| `C_MythicPlus` | wow-api-encounters | yes | 8 / 21 | 8 / 21 | 9 / 22 | 0 / 2 |
| `C_NamePlate` | wow-api-map-navigation | yes | 2 / 4 | 2 / 4 | 2 / 4 | 0 / 0 |
| `C_NamePlateManager` | wow-api-map-navigation | yes | 4 / 4 | 4 / 4 | 4 / 4 | 4 / 7 |
| `C_NameUtil` | wow-lua-api | **no** | — | 1 / 1 | — | 0 / 0 |
| `C_Navigation` | wow-api-map-navigation | yes | 3 / 7 | 3 / 7 | — | 1 / 3 |
| `C_NeighborhoodInitiative` | wow-api-housing | yes | 20 / 20 | 20 / 20 | 19 / 19 | 6 / 6 |
| `C_NewItems` | wow-api-items-inventory | **no** | 3 / 3 | 3 / 3 | 3 / 3 | 0 / 0 |
| `C_PaperDollInfo` | wow-api-unit-player | yes | 9 / 20 | 11 / 21 | 3 / 10 | 19 / 23 |
| `C_PartyInfo` | wow-api-group-lfg | yes | 37 / 53 | 39 / 55 | 14 / 23 | 20 / 33 |
| `C_PartyPose` | wow-api-group-lfg | **no** | 4 / 4 | 4 / 4 | 0 / 0 | 1 / 1 |
| `C_PerksActivities` | wow-api-currency-economy | yes | 4 / 10 | 4 / 10 | — | 3 / 4 |
| `C_PerksProgram` | wow-api-currency-economy | yes | 14 / 24 | 14 / 24 | — | 12 / 15 |
| `C_PetBattles` | wow-api-collections | yes | 0 / 5 | 0 / 5 | 0 / 5 | 0 / 0 |
| `C_PetInfo` | wow-api-collections | yes | 7 / 7 | 13 / 14 | 2 / 2 | 8 / 12 |
| `C_PetJournal` | wow-api-collections | yes | 20 / 25 | 20 / 25 | 19 / 24 | 11 / 15 |
| `C_PhotoSharing` | wow-api-misc-systems | **no** | 11 / 11 | 11 / 11 | 11 / 11 | 5 / 5 |
| `C_Ping` | wow-api-social-chat | yes | 6 / 6 | 6 / 6 | 1 / 1 | 1 / 1 |
| `C_PingSecure` | wow-api-social-chat | **no** | 19 / 19 | 19 / 19 | 0 / 0 | 2 / 2 |
| `C_Platform` | wow-api-settings-system | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| `C_PlayerChoice` | wow-api-quests | yes | 2 / 7 | 2 / 7 | — | 0 / 2 |
| `C_PlayerInfo` | wow-api-unit-player | yes | 31 / 39 | 32 / 40 | 15 / 20 | 0 / 0 |
| `C_PlayerInteractionManager` | wow-api-unit-player | yes | 5 / 7 | 6 / 8 | 5 / 7 | 0 / 2 |
| `C_PlayerMentorship` | wow-api-social-chat | **no** | 5 / 5 | 5 / 5 | — | 2 / 2 |
| `C_Pony` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| `C_ProfSpecs` | wow-api-professions | **no** | 27 / 27 | 27 / 27 | — | 2 / 2 |
| `C_PvP` | wow-api-pvp | yes | 86 / 113 | 86 / 113 | 27 / 37 | 27 / 43 |
| `C_QuestChoice` | wow-api-quests | **no** | — | — | 8 / 8 | — |
| `C_QuestHub` | wow-api-quests | **no** | 2 / 2 | 2 / 2 | — | 0 / 0 |
| `C_QuestInfoSystem` | wow-api-quests | yes | 4 / 9 | 4 / 9 | 1 / 5 | 0 / 0 |
| `C_QuestItemUse` | wow-api-quests | yes | 1 / 1 | 1 / 1 | — | 0 / 0 |
| `C_QuestLine` | wow-api-quests | **no** | 7 / 7 | 7 / 7 | 0 / 0 | 0 / 0 |
| `C_QuestLog` | wow-api-quests | yes | 46 / 90 | 49 / 93 | 6 / 11 | 5 / 17 |
| `C_QuestOffer` | wow-api-quests | yes | 4 / 4 | 4 / 4 | 0 / 0 | 2 / 5 |
| `C_QuestSession` | wow-api-quests | yes | 6 / 14 | 6 / 14 | 6 / 14 | 3 / 8 |
| `C_RaidLocks` | wow-api-encounters | **no** | 3 / 3 | 4 / 4 | 3 / 3 | 0 / 0 |
| `C_RecentAllies` | wow-api-social-chat | yes | 13 / 14 | 14 / 15 | 12 / 13 | 5 / 5 |
| `C_RecruitAFriend` | wow-api-social-chat | yes | 12 / 16 | 12 / 16 | 10 / 15 | 5 / 5 |
| `C_Reforge` | wow-api-items-inventory | **no** | — | — | 9 / 9 | — |
| `C_RemixArtifactUI` | wow-api-items-inventory | **no** | 8 / 8 | 8 / 8 | 0 / 0 | 2 / 2 |
| `C_ReportSystem` | wow-api-misc-systems | yes | 9 / 12 | 9 / 12 | 9 / 12 | 2 / 2 |
| `C_Reputation` | wow-api-reputation | yes | 13 / 27 | 13 / 27 | 2 / 8 | 0 / 1 |
| `C_ResearchInfo` | wow-api-misc-systems | yes | 0 / 1 | 0 / 1 | 0 / 1 | 8 / 8 |
| `C_RestrictedActions` | wow-api-lua-environment | yes | 0 / 3 | 0 / 3 | 0 / 3 | 4 / 5 |
| `C_Roleset` | wow-api-talents | **no** | 3 / 3 | 3 / 3 | — | 0 / 0 |
| `C_ScenarioInfo` | wow-api-encounters | yes | 6 / 10 | 6 / 10 | 6 / 10 | 6 / 9 |
| `C_ScrappingMachineUI` | wow-api-items-inventory | **no** | 11 / 11 | 11 / 11 | — | 4 / 4 |
| `C_ScriptWarnings` | wow-api-lua-environment | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 1 |
| `C_ScriptedAnimations` | wow-api-widget | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| `C_SeasonInfo` | wow-api-encounters | yes | 1 / 2 | 2 / 3 | — | 0 / 0 |
| `C_Seasons` | wow-api-encounters | **no** | — | — | 2 / 2 | — |
| `C_Secrets` | wow-api-combat | yes | 11 / 27 | 11 / 27 | 11 / 26 | 0 / 0 |
| `C_SecureTransfer` | wow-api-lua-environment | **no** | 11 / 11 | 14 / 14 | 6 / 6 | 6 / 6 |
| `C_SettingsUtil` | wow-api-settings-system | yes | 1 / 2 | 1 / 2 | 1 / 2 | 2 / 2 |
| `C_SkillInfo` | wow-api-professions | **no** | 0 / 0 | 8 / 8 | 0 / 0 | 0 / 1 |
| `C_SocialQueue` | wow-api-group-lfg | yes | 6 / 10 | 6 / 10 | 0 / 0 | 3 / 3 |
| `C_SocialRestrictions` | wow-api-social-chat | yes | 8 / 12 | 8 / 12 | 4 / 8 | 4 / 4 |
| `C_SocialUI` | wow-api-social-chat | **no** | 1 / 1 | 1 / 1 | — | 1 / 1 |
| `C_Soulbinds` | wow-api-talents | yes | 37 / 39 | 37 / 39 | — | 13 / 13 |
| `C_Sound` | wow-api-settings-system | yes | 4 / 6 | 4 / 6 | 3 / 5 | 2 / 2 |
| `C_SpecializationInfo` | wow-api-talents | yes | 15 / 26 | 20 / 31 | 8 / 10 | 8 / 10 |
| `C_Spell` | wow-api-spells-abilities | yes | 5 / 65 | 11 / 71 | 1 / 48 | 5 / 6 |
| `C_SpellActivationOverlay` | wow-api-spells-abilities | yes | 0 / 1 | 0 / 1 | 0 / 1 | 0 / 4 |
| `C_SpellBook` | wow-api-spells-abilities | yes | 1 / 46 | 6 / 51 | 0 / 7 | 7 / 19 |
| `C_SpellDiminish` | wow-api-spells-abilities | yes | 0 / 4 | 0 / 4 | 0 / 4 | 1 / 1 |
| `C_SplashScreen` | wow-api-misc-systems | yes | 2 / 5 | 2 / 5 | — | 1 / 1 |
| `C_StableInfo` | wow-api-collections | yes | 8 / 14 | 11 / 17 | 1 / 2 | 5 / 5 |
| `C_StorePublic` | wow-api-currency-economy | yes | 1 / 3 | 1 / 3 | 2 / 4 | 0 / 0 |
| `C_StringUtil` | wow-lua-api | yes | 15 / 15 | 15 / 15 | 15 / 15 | 0 / 0 |
| `C_SummonInfo` | wow-api-unit-player | **no** | 7 / 7 | 7 / 7 | 7 / 7 | 0 / 0 |
| `C_SuperTrack` | wow-api-map-navigation | yes | 8 / 20 | 8 / 20 | — | 1 / 2 |
| `C_SwingTimer` | wow-api-combat | yes | — | 0 / 2 | — | 0 / 2 |
| `C_System` | wow-api-widget | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 26 / 31 |
| `C_SystemVisibilityManager` | wow-api-widget | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 1 / 1 |
| `C_TTSSettings` | wow-api-settings-system | yes | 14 / 19 | 14 / 19 | 14 / 19 | 0 / 0 |
| `C_TableUtil` | wow-lua-api | yes | — | — | 1 / 1 | — |
| `C_TalkingHead` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | — | 2 / 2 |
| `C_TaskQuest` | wow-api-quests | yes | 4 / 12 | 4 / 12 | 3 / 11 | 0 / 0 |
| `C_TaxiMap` | wow-api-map-navigation | yes | 0 / 3 | 0 / 3 | 0 / 2 | 1 / 3 |
| `C_Texture` | wow-api-widget | yes | 10 / 11 | 10 / 11 | 10 / 11 | 1 / 1 |
| `C_Timer` | wow-api-lua-environment | yes | 1 / 4 | 1 / 4 | 0 / 3 | 0 / 0 |
| `C_TimerunningUI` | wow-api-misc-systems | **no** | 1 / 1 | 1 / 1 | — | 1 / 1 |
| `C_TooltipComparison` | wow-api-misc-systems | yes | 1 / 3 | 1 / 3 | 0 / 0 | 1 / 1 |
| `C_TooltipInfo` | wow-api-misc-systems | yes | 70 / 82 | 70 / 82 | 0 / 0 | 2 / 3 |
| `C_ToyBoxInfo` | wow-api-collections | yes | 3 / 5 | 4 / 6 | 0 / 2 | 0 / 2 |
| `C_TradeInfo` | wow-api-currency-economy | **no** | 4 / 4 | 4 / 4 | 4 / 4 | 9 / 15 |
| `C_TradeSkillUI` | wow-api-professions | yes | 68 / 88 | 69 / 90 | 3 / 4 | 12 / 20 |
| `C_Trainer` | wow-api-professions | **no** | 0 / 0 | 3 / 3 | 0 / 0 | 5 / 5 |
| `C_TraitConfig` | wow-api-talents | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| `C_Traits` | wow-api-talents | yes | 28 / 49 | 30 / 53 | 28 / 49 | 7 / 15 |
| `C_Transmog` | wow-api-transmog | **no** | 7 / 7 | 7 / 7 | 6 / 6 | 5 / 15 |
| `C_TransmogCollection` | wow-api-transmog | yes | 62 / 83 | 63 / 84 | 62 / 83 | 0 / 0 |
| `C_TransmogOutfitInfo` | wow-api-transmog | yes | 67 / 67 | 67 / 67 | 66 / 66 | 7 / 8 |
| `C_TransmogSets` | wow-api-transmog | yes | 30 / 41 | 31 / 42 | 30 / 41 | 0 / 0 |
| `C_Tutorial` | wow-api-misc-systems | yes | 3 / 3 | 4 / 4 | 0 / 0 | 5 / 6 |
| `C_UI` | wow-api-widget | **no** | 7 / 7 | 7 / 7 | 5 / 5 | 2 / 2 |
| `C_UIActionHandler` | wow-api-widget | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 1 / 1 |
| `C_UIColor` | wow-api-widget | **no** | 1 / 1 | 1 / 1 | 1 / 1 | 0 / 0 |
| `C_UIFileAsset` | wow-api-widget | **no** | 3 / 3 | 3 / 3 | 3 / 3 | 0 / 0 |
| `C_UIWidgetManager` | wow-api-widget | **no** | 42 / 42 | 42 / 42 | 42 / 42 | 2 / 2 |
| `C_UnitAuras` | wow-api-unit-player | yes | 18 / 38 | 18 / 38 | 9 / 32 | 5 / 6 |
| `C_UserFeedback` | wow-api-misc-systems | yes | 0 / 2 | 0 / 2 | 0 / 2 | 0 / 0 |
| `C_Vehicle` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 8 / 10 |
| `C_VideoOptions` | wow-api-settings-system | yes | 6 / 6 | 11 / 11 | 6 / 6 | 9 / 9 |
| `C_VignetteInfo` | wow-api-map-navigation | yes | 2 / 6 | 2 / 6 | 0 / 0 | 0 / 2 |
| `C_VoiceChat` | wow-api-social-chat | yes | 54 / 79 | 57 / 82 | 53 / 78 | 47 / 51 |
| `C_WarbandScene` | wow-api-misc-systems | **no** | 6 / 6 | 7 / 7 | — | 2 / 2 |
| `C_Weather` | wow-api-misc-systems | **no** | 1 / 1 | 1 / 1 | — | 1 / 1 |
| `C_WeeklyRewards` | wow-api-weekly-rewards | yes | 11 / 21 | 11 / 21 | — | 0 / 2 |
| `C_WorldLootObject` | wow-api-items-inventory | yes | 3 / 8 | 3 / 8 | 0 / 0 | 1 / 1 |
| `C_WorldSafeLocsUIInternal` | wow-api-misc-systems | **no** | 1 / 1 | 1 / 1 | — | 0 / 0 |
| `C_WorldStateInfo` | wow-api-map-navigation | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 5 / 6 |
| `C_WowEntitlementInfo` | wow-api-misc-systems | **no** | 0 / 0 | 0 / 0 | 0 / 0 | 2 / 2 |
| `C_WowSurvey` | wow-api-misc-systems | **no** | 2 / 2 | 2 / 2 | 2 / 2 | 1 / 1 |
| `C_WowTokenUI` | wow-api-currency-economy | yes | 1 / 1 | 2 / 2 | 1 / 1 | 13 / 15 |
| `C_XMLUtil` | wow-api-widget | **no** | 2 / 2 | 2 / 2 | 2 / 2 | 0 / 0 |
| `C_ZoneAbility` | wow-api-map-navigation | yes | 1 / 2 | 1 / 2 | — | 0 / 0 |
| `math` | **UNROUTED** | yes | 11 / 11 | 11 / 11 | — | 0 / 0 |
| `string` | **UNROUTED** | yes | 6 / 6 | 6 / 6 | 1 / 1 | 0 / 0 |
| `table` | **UNROUTED** | yes | 11 / 12 | 11 / 12 | 3 / 4 | 0 / 0 |

## Global API system matrix

| Generated global system | Retail functions | Forever functions | Classic functions | Forever events |
|---|---:|---:|---:|---:|
| `Global:ArenaTeam` | — | — | 7 / 7 | — |
| `Global:BNetOutage` | 2 / 2 | 2 / 2 | 2 / 2 | 0 / 0 |
| `Global:BagIndexConstants` | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| `Global:Build` | 11 / 12 | 11 / 12 | 4 / 4 | 0 / 0 |
| `Global:Camera` | 2 / 2 | 2 / 2 | 2 / 2 | 0 / 0 |
| `Global:Cinematic` | 3 / 7 | 3 / 7 | 3 / 7 | 2 / 6 |
| `Global:Client` | 9 / 10 | 11 / 12 | 9 / 10 | 0 / 0 |
| `Global:ConnectionScript` | 11 / 13 | 11 / 13 | 10 / 12 | 0 / 0 |
| `Global:Console` | 10 / 10 | 10 / 10 | 8 / 8 | 7 / 7 |
| `Global:DebugToggle` | 9 / 9 | 9 / 9 | 9 / 9 | 0 / 0 |
| `Global:Expansion` | 22 / 23 | 23 / 24 | 18 / 18 | 3 / 3 |
| `Global:ExpansionInfo` | 3 / 3 | 3 / 3 | 3 / 3 | 0 / 0 |
| `Global:Font` | 3 / 3 | 3 / 3 | 1 / 1 | 0 / 0 |
| `Global:FrameScript` | 22 / 38 | 22 / 38 | 18 / 34 | 0 / 0 |
| `Global:GameCursor` | 12 / 19 | 12 / 19 | 8 / 15 | 0 / 0 |
| `Global:GameError` | 2 / 2 | 2 / 2 | 2 / 2 | 0 / 0 |
| `Global:GameUI` | 2 / 2 | 2 / 2 | 2 / 2 | 0 / 0 |
| `Global:Input` | 28 / 29 | 30 / 31 | 10 / 10 | 1 / 1 |
| `Global:Instance` | 16 / 18 | 16 / 18 | 16 / 18 | 0 / 0 |
| `Global:Locale` | 3 / 5 | 3 / 5 | 3 / 5 | 0 / 0 |
| `Global:Localization` | 7 / 10 | 7 / 10 | 4 / 7 | 0 / 0 |
| `Global:MirrorTimer` | 0 / 2 | 0 / 2 | 0 / 2 | 0 / 0 |
| `Global:Movie` | 6 / 6 | 6 / 6 | 0 / 0 | 0 / 0 |
| `Global:Os` | 2 / 2 | 2 / 2 | 2 / 2 | 0 / 0 |
| `Global:ParentalControls` | 1 / 1 | 1 / 1 | 0 / 0 | 0 / 0 |
| `Global:PerformanceScript` | 9 / 9 | 9 / 9 | 9 / 9 | 0 / 0 |
| `Global:PlayerScript` | 108 / 169 | 129 / 190 | 65 / 94 | 2 / 2 |
| `Global:PvpInfo` | 1 / 1 | 1 / 1 | — | 0 / 0 |
| `Global:RaidMarkers` | 3 / 8 | 4 / 9 | 3 / 8 | 0 / 0 |
| `Global:RestrictedActions` | 0 / 1 | 0 / 1 | 0 / 1 | 0 / 0 |
| `Global:Screen` | 5 / 5 | 5 / 5 | 0 / 0 | 0 / 0 |
| `Global:SlashCommand` | 2 / 2 | 2 / 2 | 2 / 2 | 0 / 0 |
| `Global:SpecializationShared` | 3 / 5 | 3 / 5 | 2 / 4 | 0 / 0 |
| `Global:Streaming` | 4 / 4 | 4 / 4 | 4 / 4 | 0 / 0 |
| `Global:SystemTime` | 3 / 7 | 3 / 7 | 0 / 0 | 0 / 0 |
| `Global:TargetScript` | 14 / 23 | 15 / 24 | 14 / 23 | 0 / 0 |
| `Global:Threat` | 2 / 2 | 2 / 2 | 2 / 2 | 0 / 0 |
| `Global:Title` | 5 / 5 | 5 / 5 | 5 / 5 | 0 / 0 |
| `Global:Totem` | 2 / 7 | 2 / 7 | 2 / 7 | 0 / 0 |
| `Global:URL` | 2 / 2 | 2 / 2 | 1 / 1 | 0 / 0 |
| `Global:Unit` | 90 / 210 | 98 / 218 | 53 / 132 | 73 / 142 |
| `Global:UnitRole` | 0 / 6 | 0 / 6 | 0 / 6 | 1 / 2 |
| `Global:ZoneScript` | 1 / 5 | 1 / 5 | 1 / 5 | 0 / 0 |

## ScriptObject matrix

| Generated object | Retail methods | Forever methods | Classic methods |
|---|---:|---:|---:|
| `Object:AbbreviateConfigAPI` | 2 / 2 | 2 / 2 | 2 / 2 |
| `Object:AbbreviatedNumberFormatterAPI` | 6 / 6 | 6 / 6 | 6 / 6 |
| `Object:DurationTextBindingObjectAPI` | 25 / 30 | 25 / 30 | 19 / 24 |
| `Object:FrameAPIArchaeologyDigSiteFrame` | 0 / 0 | 0 / 0 | 0 / 0 |
| `Object:FrameAPIBlob` | 0 / 14 | 0 / 14 | 0 / 14 |
| `Object:FrameAPICharacterModelBase` | 0 / 24 | 0 / 24 | 0 / 24 |
| `Object:FrameAPICinematicModel` | 0 / 18 | 0 / 18 | 0 / 18 |
| `Object:FrameAPICooldown` | 34 / 46 | 34 / 46 | 34 / 46 |
| `Object:FrameAPIDressUpModel` | 0 / 20 | 0 / 20 | 2 / 22 |
| `Object:FrameAPIFogOfWarFrame` | 0 / 12 | 0 / 12 | 0 / 12 |
| `Object:FrameAPIModelSceneFrame` | 0 / 47 | 0 / 47 | 0 / 47 |
| `Object:FrameAPIModelSceneFrameActor` | 2 / 31 | 2 / 31 | 2 / 28 |
| `Object:FrameAPIModelSceneFrameActorBase` | 6 / 49 | 7 / 50 | 6 / 49 |
| `Object:FrameAPINamePlate` | 6 / 6 | 6 / 6 | 6 / 6 |
| `Object:FrameAPIQuestPOI` | 0 / 3 | 0 / 3 | 0 / 3 |
| `Object:FrameAPIScenarioPOI` | 0 / 2 | 0 / 2 | 0 / 2 |
| `Object:FrameAPISimpleCheckout` | 5 / 8 | 5 / 8 | 5 / 8 |
| `Object:FrameAPITabardModel` | 0 / 6 | 0 / 6 | 2 / 6 |
| `Object:FrameAPITabardModelBase` | 0 / 7 | 0 / 7 | 0 / 7 |
| `Object:FrameAPITooltip` | 6 / 9 | 6 / 9 | 4 / 5 |
| `Object:FrameAPIUnitPositionFrame` | 0 / 12 | 0 / 12 | 0 / 12 |
| `Object:HousingCatalogSearcherAPI` | 45 / 46 | 45 / 46 | 45 / 46 |
| `Object:HousingFixturePointFrameAPI` | 4 / 5 | 4 / 5 | 4 / 5 |
| `Object:HousingLayoutPinFrameAPI` | 16 / 17 | 16 / 17 | 16 / 17 |
| `Object:LuaColorCurveObjectAPI` | 10 / 11 | 10 / 11 | 10 / 11 |
| `Object:LuaCurveObjectAPI` | 9 / 10 | 9 / 10 | 9 / 10 |
| `Object:LuaCurveObjectBaseAPI` | 2 / 3 | 2 / 3 | 2 / 3 |
| `Object:LuaDurationClockObjectAPI` | 1 / 1 | 1 / 1 | 1 / 1 |
| `Object:LuaDurationManualClockAPI` | 3 / 4 | 3 / 4 | 3 / 4 |
| `Object:LuaDurationObjectAPI` | 28 / 31 | 28 / 31 | 28 / 31 |
| `Object:LuaLocaleContextAPI` | 22 / 22 | 22 / 22 | — |
| `Object:MinimapFrameAPI` | 1 / 29 | 3 / 31 | 0 / 13 |
| `Object:NumericFormatterAPI` | 1 / 1 | 1 / 1 | 1 / 1 |
| `Object:NumericRuleFormatterAPI` | 5 / 5 | 5 / 5 | 5 / 5 |
| `Object:PingPinFrameAPI` | 0 / 0 | 0 / 0 | 0 / 0 |
| `Object:SecondsFormatterAPI` | 35 / 35 | 35 / 35 | 33 / 33 |
| `Object:SimpleAnimAPI` | 21 / 36 | 21 / 36 | 21 / 36 |
| `Object:SimpleAnimAlphaAPI` | 2 / 4 | 2 / 4 | 2 / 4 |
| `Object:SimpleAnimFlipBookAPI` | 10 / 10 | 10 / 10 | 10 / 10 |
| `Object:SimpleAnimGroupAPI` | 18 / 28 | 18 / 28 | 18 / 28 |
| `Object:SimpleAnimPathAPI` | 4 / 5 | 4 / 5 | 4 / 5 |
| `Object:SimpleAnimRadialProgressAPI` | 4 / 4 | 4 / 4 | — |
| `Object:SimpleAnimRotationAPI` | 4 / 6 | 4 / 6 | 4 / 6 |
| `Object:SimpleAnimScaleAPI` | 5 / 8 | 5 / 8 | 5 / 8 |
| `Object:SimpleAnimScaleLineAPI` | 0 / 0 | 0 / 0 | 0 / 0 |
| `Object:SimpleAnimTextureCoordTranslationAPI` | 1 / 2 | 1 / 2 | 1 / 2 |
| `Object:SimpleAnimTranslationAPI` | 1 / 2 | 1 / 2 | 1 / 2 |
| `Object:SimpleAnimTranslationLineAPI` | 0 / 0 | 0 / 0 | 0 / 0 |
| `Object:SimpleAnimVertexColorAPI` | 4 / 4 | 4 / 4 | 4 / 4 |
| `Object:SimpleAnimatableObjectAPI` | 2 / 3 | 2 / 3 | 2 / 3 |
| `Object:SimpleBrowserAPI` | 9 / 12 | 9 / 12 | 9 / 12 |
| `Object:SimpleButtonAPI` | 34 / 42 | 34 / 42 | 34 / 42 |
| `Object:SimpleCheckboxAPI` | 5 / 6 | 5 / 6 | 5 / 6 |
| `Object:SimpleColorSelectAPI` | 18 / 19 | 18 / 19 | 18 / 19 |
| `Object:SimpleControlPointAPI` | 2 / 5 | 2 / 5 | 2 / 5 |
| `Object:SimpleEditBoxAPI` | 56 / 79 | 56 / 79 | 56 / 79 |
| `Object:SimpleFontAPI` | 16 / 24 | 16 / 24 | 16 / 24 |
| `Object:SimpleFontStringAPI` | 41 / 57 | 41 / 57 | 40 / 56 |
| `Object:SimpleFrameAPI` | 87 / 126 | 87 / 126 | 78 / 117 |
| `Object:SimpleFrameScriptObjectAPI` | 15 / 21 | 15 / 21 | 4 / 10 |
| `Object:SimpleHTMLAPI` | 15 / 23 | 15 / 23 | 15 / 23 |
| `Object:SimpleLineAPI` | 6 / 9 | 6 / 9 | 6 / 9 |
| `Object:SimpleMapSceneAPI` | 1 / 5 | 1 / 5 | — |
| `Object:SimpleMaskTextureAPI` | 0 / 0 | 0 / 0 | 0 / 0 |
| `Object:SimpleMessageFrameAPI` | 20 / 33 | 20 / 33 | 20 / 33 |
| `Object:SimpleModelAPI` | 1 / 65 | 1 / 65 | 1 / 65 |
| `Object:SimpleModelFFXAPI` | 4 / 4 | 4 / 4 | 4 / 4 |
| `Object:SimpleMovieAPI` | 0 / 4 | 0 / 4 | 0 / 4 |
| `Object:SimpleObjectAPI` | 2 / 5 | 2 / 5 | 2 / 5 |
| `Object:SimpleOffScreenFrameAPI` | 8 / 8 | 8 / 8 | 8 / 8 |
| `Object:SimpleRegionAPI` | 6 / 16 | 6 / 16 | 6 / 16 |
| `Object:SimpleScriptRegionAPI` | 36 / 51 | 40 / 55 | 34 / 49 |
| `Object:SimpleScriptRegionResizingAPI` | 8 / 13 | 8 / 13 | 8 / 13 |
| `Object:SimpleScrollFrameAPI` | 8 / 9 | 8 / 9 | 8 / 9 |
| `Object:SimpleSliderAPI` | 11 / 19 | 11 / 19 | 11 / 19 |
| `Object:SimpleStatusBarAPI` | 17 / 28 | 17 / 28 | 15 / 26 |
| `Object:SimpleTextureAPI` | 4 / 4 | 4 / 4 | 4 / 4 |
| `Object:SimpleTextureBaseAPI` | 41 / 52 | 41 / 52 | 28 / 39 |
| `Object:SimpleVectorGraphicsAPI` | 4 / 4 | 4 / 4 | — |
| `Object:TimedSignalMapAPI` | 8 / 8 | 8 / 8 | — |
| `Object:UnitHealPredictionCalculatorAPI` | 33 / 35 | 33 / 35 | 33 / 35 |

## Exact Forever backlog

See [Forever symbol gaps](FOREVER-SYMBOL-GAPS.md) for every generated Forever function/event/method without a matching mention and pinned source links. See [machine-readable evidence](api-coverage.json) for all three inventories, including mentioned symbols and source locations.

Before filling rows, classify addon-facing eligibility: this denominator includes front-end/Glue APIs (for example `C_Glue` is labeled `Environment = All`), SecureOnly definitions, platform-specific functions, and systems whose client loading has not been traced. `All` is not an addon-permission filter. Excluding an inapplicable row with evidence is a valid resolution.

## Reconcile the older runtime capture

Clone `Thunderz96/forever-addon-kit` separately at commit `8dc297689059dd204bf8663a05aaa36d6a628b76`, then run:

```sh
node scripts/audit-api-coverage.mjs --kit PATH_TO_KIT_CHECKOUT
```

This also regenerates [runtime set differences](forever-runtime-comparison.json), including all namespace/member differences. It compares the build 69893 capture with generated build 1.60.1.70938 definitions. It excludes contaminated top-level globals and frames; the capture has no event inventory. Missing from either set means unknown until source/loading/runtime checks explain the difference.
