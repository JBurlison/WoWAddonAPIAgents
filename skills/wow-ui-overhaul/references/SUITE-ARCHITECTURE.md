# Modular UI suite architecture

Total-conversion UI overhauls (unit frames, action bars, nameplates, minimap, bags, chat, tooltips) share one theme and layout backbone while keeping each HUD surface independent, opt-out safe, and client-scoped.

## Separate layers and module ownership

| Layer | Owns | Does not own |
|---|---|---|
| Core & callback bus | Addon namespace, lifecycle (`ADDON_LOADED`, `PLAYER_LOGIN`), internal theme/layout events, combat-defer queue | Specific HUD frame visuals |
| Theme tokens | Colors, fonts, edge sizes, backdrop opacity, glass/accent textures, 1px pixel helpers | Saved coordinates or game state |
| Client adapter | Target differences (`TooltipDataProcessor` vs. Classic hooks, Secret Value guards, Blizzard frame paths) | Global style overrides |
| Layout & mover engine | Anchors, grid snap, nudge controls, profile persistence, optional `EditMode` bridge | Hardcoded module logic |
| Feature modules | Unit frames, cast bars, action bars, nameplates, bags, chat, minimap, tooltips (each toggleable) | Unrelated Blizzard windows |

Enable every module through a centralized `SavedVariables` table initialized in `ADDON_LOADED` with stable internal IDs, plus a built-in Settings menu category so users can disable any surface without touching Lua.

## Suppressing Blizzard frames safely

Never call `:Hide()` repeatedly in an `OnUpdate` loop or overwrite Blizzard secure frame scripts. Use a dedicated hidden parent and, where secure visibility applies, `RegisterStateDriver`:

```lua
local Hider = CreateFrame("Frame", nil, UIParent)
Hider:Hide()

local function SuppressFrame(frame, useStateDriver)
    if not frame or InCombatLockdown() then return false end
    frame:UnregisterAllEvents()
    if useStateDriver and RegisterStateDriver then
        RegisterStateDriver(frame, "visibility", "hide")
    else
        frame:SetParent(Hider)
        frame:Hide()
    end
    return true
end
```

- **Protected frames** (`MainActionBar`, `PlayerFrame`, `TargetFrame`, `CompactRaidFrameManager`): guard against `InCombatLockdown()` and prefer `RegisterStateDriver(frame, "visibility", "hide")` or `UnregisterAllEvents()` + hidden parent only after verifying the owning Blizzard frame's children and dependencies at the pinned commit.
- **Disabling a module:** Restoring an unhooked, event-stripped Blizzard frame cleanly at runtime is rarely safe once combat or layout passes have run; document honestly that toggling a full-replacement module off takes effect cleanly after `/reload`.

## Edit Mode vs. custom mover grid

Check `Blizzard_EditMode` loading at the pinned commit (`Interface/AddOns/Blizzard_EditMode/Blizzard_EditMode.toc` across Retail `12.1.5.70961`, Forever `1.60.1.71037`, and Classic `5.5.4.71060`; note Forever includes `Camelot/EditModeUtil.lua` and Classic Mists includes `[Game]/EditModeManagerOverrides.lua`):

- **Custom mover overlay (`/suite move`):** Build an addon-owned mover frame per movable module (`IsMovable`, `RegisterForDrag("LeftButton")`, snap-to-grid/center guides, arrow-key 1px nudge, combat auto-lock on `PLAYER_REGEN_DISABLED`), saving relative points (`point, relativePoint, xOfs, yOfs`) in `SavedVariables`. This works identically across Retail, Forever, and Classic without touching Edit Mode internals.
- **Edit Mode coexistence:** When not replacing Edit Mode, never taint `EditModeManagerFrame` tables; optionally listen to `EDIT_MODE_LAYOUTS_UPDATED` / `C_EditMode` callbacks (`EditModeManagerDocumentation.lua`) to refresh non-conflicting anchors.

## Live theme updates and profile export

- Store active theme tokens in one table and dispatch an addon-local `THEME_CHANGED` callback so frames recolor/re-font immediately when settings change without requiring `/reload`.
- For profile import/export strings, query `C_EncodingUtil` (`EncodingUtilDocumentation.lua`, `EncodingUtilConstantsDocumentation.lua` with `EncodingDeserializeSizeLimit` = `104857600` on Retail `ab5cb850` and Forever `734f0653`), validate decoded tables strictly with an allowlist schema before writing to `SavedVariables`, and avoid running `loadstring` on untrusted user strings.
