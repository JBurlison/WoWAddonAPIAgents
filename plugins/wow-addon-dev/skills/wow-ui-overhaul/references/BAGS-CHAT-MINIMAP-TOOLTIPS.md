# Bags, chat, minimap, and tooltips

Total-conversion HUD suites routinely unify bags, chat, minimap, and tooltips under the same theme tokens and dark-glass frame styling.

## Merged bags / inventory

Trace `ContainerFrame` loading per target (`Mainline/ContainerFrame.lua` on Retail `ab5cb850`, `Camelot/ContainerFrame.lua` and `Mainline/ContainerFrame.lua` on Forever `734f0653`, and `Classic/ContainerFrame.xml` + `Mists/ContainerFrame.lua` on Classic `e171ae99`):

- **Combat-safe item use:** Bag slots that let players right-click to use/equip items in combat must remain secure item buttons (`ContainerFrameItemButtonTemplate` or `SecureActionButtonTemplate` with `type2="item"` / `bag`+`slot` attributes set outside `InCombatLockdown()`). Never break bag slot interaction by substituting plain `Button` frames for usable item buttons.
- **Features:** Support search filtering (`C_Container.GetContainerItemInfo`), slot counters (`C_Container.GetContainerNumFreeSlots`), `C_Container.SortBags` (where declared), bank toggle, and equipment-set quick tabs (`C_EquipmentSet`). Query `wow-api-items-inventory` via `query.mjs --domain wow-api-items-inventory`.

## Wide / custom minimap and map pins

Inspect `Blizzard_Minimap` per target (`Blizzard_Minimap_Mainline.toc` on Retail, `Blizzard_Minimap.toc` + `Camelot/Minimap.lua` on Forever, `Blizzard_Minimap_Classic.toc` + `Classic/Minimap.lua` on Classic):

- **Rectangular / wide shape:** Replace the circular mask using `Minimap:SetMaskTexture("Interface\\AddOns\\MySuite\\Media\\WideMask.tga")` (matching aspect ratio, power-of-two `.tga`), hide circular border textures/compass elements verified on that target, and attach a pixel-snapped 1px border frame.
- **Widgets & pins:** Reposition or theme the zone text, clock (`TimeManagerClockButton` / `GameTimeFrame`), tracking, calendar, mail, and XP/Reputation bar cleanly without overlapping the minimap click surface (`Minimap_OnClick` ping). For custom world/minimap town & quest pins, read `C_Map` and `C_QuestLog` (`query.mjs --domain wow-api-map-navigation`) and avoid creating pin frames inside `OnUpdate`.

## Chat overhaul

Inspect `Interface/AddOns/Blizzard_ChatFrameBase/Shared/ChatFrame.lua` and `Mainline/FloatingChatFrame.lua`:

- Skin `ChatFrame1`..`NUM_CHAT_WINDOWS` and dynamically created temporary windows (`FCF_OpenTemporaryWindow` post-hook) by styling backgrounds, tabs, scroll buttons, and edit boxes (`ChatFrame1EditBox`) without replacing `ChatEdit_OnEnterPressed` or stripping channel history.
- **Channel-colored edit box:** `hooksecurefunc("ChatEdit_UpdateHeader", function(editBox) ... end)` safely reads `editBox:GetAttribute("chatType")` (checking `ChatTypeInfo[chatType]`) to tint the edit box border/backdrop to the active channel color (`SAY`, `PARTY`, `RAID`, `GUILD`, `WHISPER`).

## Tooltips and item-level / gear-score plates

Check `Interface/AddOns/Blizzard_SharedXMLGame/Blizzard_SharedXMLGame.toc`: `Tooltip/TooltipDataHandler.lua` uses `[ExcludeLoadGameType vanilla]`, while `Classic/GameTooltip.lua` exists on Classic (`e171ae99`):

- **Adapter pattern:** On Retail and Forever (and Mists when `TooltipDataProcessor` is present), register `TooltipDataProcessor.AddTooltipPostCall(Enum.TooltipDataType.Unit, fn)` / `.Item`; fall back to `GameTooltip:HookScript("OnTooltipSetUnit", fn)` only when `TooltipDataProcessor` is absent. Never call `SetScript` on `GameTooltip`.
- **Throttled inspect cache (ilvl / gear score):** Never spam `NotifyInspect(unit)` on every mouseover. Maintain a bounded queue + weak/timestamped GUID cache, skip when `InCombatLockdown()` or `not CanInspect(unit)` or `InspectFrame and InspectFrame:IsShown()`, wait for `INSPECT_READY`, and clear/cap cache entries so memory never grows unboundedly.
