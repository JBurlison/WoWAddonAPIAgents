# Character screen and spellbook recipes

Source paths and loading routes below were inspected **2026-11-05**. These are focused UI observations, not updates to the plugin's complete API snapshot registry and not in-game certification. Re-resolve the selected branch and the installed build before using them for a new addon task.

| Target | Reviewed UI source commit | Source version |
|---|---|---|
| Retail (`live`) | `297d7aaaa736f346b3e036f38ee088eaf7f8c07f` | [12.1.5.70783](https://github.com/Gethe/wow-ui-source/blob/297d7aaaa736f346b3e036f38ee088eaf7f8c07f/version.txt) |
| Forever (`forever`) | `9dc84f0d3bbae1768ac3405b3716000bd93eda06` | [1.60.1.70862](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/version.txt) |
| Classic progression (`classic`) | `e5d9b3a22c3f0f6f41ebac0e454f4969594261cf` | [5.5.4.70631](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/version.txt) |

## Route to the correct owner

| Target | Character / paper doll | Spellbook |
|---|---|---|
| Forever | [Blizzard_UIPanels_Game.toc](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_UIPanels_Game/Blizzard_UIPanels_Game.toc) selects Camelot CharacterFrame and PaperDollFrame files. | [Blizzard_PlayerSpells.toc](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_PlayerSpells/Blizzard_PlayerSpells.toc) declares load-on-demand and selects shared plus Camelot spellbook/player-spells files. |
| Retail | [Blizzard_UIPanels_Game_Mainline.toc](https://github.com/Gethe/wow-ui-source/blob/297d7aaaa736f346b3e036f38ee088eaf7f8c07f/Interface/AddOns/Blizzard_UIPanels_Game/Blizzard_UIPanels_Game_Mainline.toc) loads Mainline CharacterFrame/PaperDollFrame. | [Blizzard_PlayerSpells.toc](https://github.com/Gethe/wow-ui-source/blob/297d7aaaa736f346b3e036f38ee088eaf7f8c07f/Interface/AddOns/Blizzard_PlayerSpells/Blizzard_PlayerSpells.toc) is load-on-demand. Verify this pin's child paths instead of importing Forever's Camelot layout. |
| Classic progression | [Blizzard_CharacterFrame.toc](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_CharacterFrame/Blizzard_CharacterFrame.toc) selects Cata CharacterFrame/PaperDollFrame for Mists. | [Blizzard_UIPanels_Game_Classic.toc](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_UIPanels_Game/Blizzard_UIPanels_Game_Classic.toc) loads Classic shared logic and Mists spellbook files. Do not use the PlayerSpells adapter for this source route. |

TOC selectors such as `[Game]`, `[Family]` and `AllowLoadGameType` describe Blizzard's loading choices. Their presence in the repository does not make every variant active, and they are not instructions to copy wholesale into a third-party addon TOC.

## Reskin Forever's character screen

The [Camelot CharacterFrame XML](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_UIPanels_Game/Camelot/CharacterFrame.xml) defines a `CharacterFrame` with `PortraitFrameBaseTemplate` and pane-host children. The [matching Lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_UIPanels_Game/Camelot/CharacterFrame.lua) owns refresh and side-pane row-pool behavior. Review both before selecting a border or layout hook. Do not assume old `CharacterFrameInset` members from another client are present.

1. Inventory outer ornament, title/close control, pane hosts, model, equipment slots, tabs and stats. Use the accepted design to choose which pieces actually change. Start with the panel shell and one equipment slot; verify behavior before extending the skin.
2. Trace the [Camelot PaperDoll XML](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_UIPanels_Game/Camelot/PaperDollFrame.xml) and [PaperDoll Lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_UIPanels_Game/Camelot/PaperDollFrame.lua) before changing equipment visuals. Keep icon, item quality, unavailable/ignored state, cooldown, enchant/upgrade indications and tooltip anchors distinct from decorative art. Preserve slot input, drag/drop, modified-click and equipment-flyout behavior.
3. Keep the native model and its input behavior unless replacing that feature is part of the request. Anchor decoration around the verified pane/model bounds rather than moving a protected control into a new arbitrary parent.
4. Inspect `CharacterFrameSidePaneMixin` row acquisition and release. Style newly materialized rows and repaint current bindings. Keep fonts/colors separate from text values supplied by Blizzard. A post-hook on `AcquireRow` cannot be assumed to receive its return value; choose a verified later row-binding point or enumerate the current pool when appropriate.
5. Repeat with the selected Retail/Classic adapter only after tracing its own source route. Reuse theme tokens and original helper code, not Forever child paths or row-pool assumptions.

Acceptance: open and reopen the screen, switch available tabs/side panes, change gear, hover slots, exercise model interaction, scroll/recycle stats rows, and change UI scale. Test supported equipment interactions and combat transitions in the real client; retain any untested behavior as pending.

## Reskin the spellbook without replacing spell actions

Forever's [Camelot spellbook frame Lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_PlayerSpells/Camelot/SpellBook/Blizzard_SpellBookFrame.lua) and [Camelot spellbook templates](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_PlayerSpells/Camelot/SpellBook/Blizzard_SpellBookTemplates.xml) supplement shared definitions. Follow the [shared frame XML](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_PlayerSpells/SpellBook/Blizzard_SpellBookFrame.xml) and [SpellBookItem.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_PlayerSpells/SpellBook/Blizzard_SpellBookItem.lua) for the actual hierarchy and state updates. Do not invent a fixed global array of spell buttons for the modern paged view.

1. Wait for the verified PlayerSpells owner and resolve its spellbook panel. Separately resolve search, category tabs, paged content and navigation as they are created. Theme the shell and controls without replacing search/filter/category logic.
2. Follow spell-item binding and visual updates. Distinguish background/border from icon, text, selection, availability, autocast, cooldown, action-bar indication and flyout affordances. Skin every relevant state, including disabled/unlearned and pet/passive states where supported by that client.
3. Install decoration once, then refresh from the current binding when the page, category, search results or spell data changes. Preserve native spell identifiers, action attributes and scripts. Do not add your own casting `OnClick` as part of a cosmetic change.
4. For Retail, verify the current PlayerSpells hierarchy and layout even though the addon owner matches. For Classic progression, inspect [Mists SpellBookFrame.xml](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_UIPanels_Game/Mists/SpellBookFrame.xml): its `SpellButtonTemplate` inherits `SecureFrameTemplate, FlyoutButtonTemplate`. Preserve that contract and implement a separate adapter; do not transplant the modern paging hierarchy.

Acceptance: first open after login, reopen after closing, navigate categories/pages, filter/search where available, change pet or specialization where supported, inspect tooltips/flyouts, and test dragging to action bars. Validate normal/pushed/checked/disabled visuals, cooldown/autocast indicators, input hints, and combat behavior on each selected client. A correct static screenshot does not prove spell interaction is intact.

## Extend the pattern to another native window

Find its root in the selected source tree, follow its owning TOC and templates, and record the creation/update/reset path before styling. Classify each child as ornament, input, data visualization or transient view. Build one opt-in window module and reuse only verified theme/helper behavior. Missing fields should disable the affected feature with a clear diagnostic, not trigger a broad recursive search that skins unrelated objects.
