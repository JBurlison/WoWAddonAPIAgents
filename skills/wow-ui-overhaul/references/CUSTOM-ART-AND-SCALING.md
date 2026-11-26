# Custom art, geometry, and 4K scaling

Full HUD suites often pair non-rectangular geometry (slanted bars, diamond badges, wide minimaps), dark-glass layering, animated resource fills, and crisp 1px borders across 1080p, 1440p, and 4K monitors.

## Pixel-perfect scaling across 1080p, 1440p, and 4K

WoW renders UI in a virtual `768`-unit-high coordinate space scaled by `UIParent:GetEffectiveScale()`. Non-integer physical pixel sizes cause 1px borders and thin gaps to shimmer or vanish on 4K displays.

Pinned Blizzard implementation (`Interface/AddOns/Blizzard_SharedXML/PixelUtil.lua` in Retail `ab5cb850`, Forever `734f0653`, and Classic `e171ae99`):

```lua
-- PixelUtil.GetPixelToUIUnitFactor() divides 768.0 by physicalHeight from GetPhysicalScreenSize()
local function PixelSize(frame, pixels)
    if PixelUtil and PixelUtil.GetNearestPixelSize then
        return PixelUtil.GetNearestPixelSize(pixels, frame:GetEffectiveScale(), pixels > 0 and 1 or 0)
    end
    local _, physicalHeight = GetPhysicalScreenSize()
    local factor = 768.0 / physicalHeight
    return pixels * factor / frame:GetEffectiveScale()
end
```

- Note: `GetPhysicalScreenSize` is declared in `ScreenDocumentation.lua` on Retail and Forever, and also called by `Blizzard_SharedXML/PixelUtil.lua` across all three pinned trees (including Classic `e171ae99`). Still guard with `PixelUtil` presence checks per target.
- Never call `UIParent:SetScale()` from an addon; apply `PixelUtil.SetSize` / `PixelUtil.SetPoint` (or `PixelSize`) on addon-owned frames and re-run layout snapping on `UI_SCALE_CHANGED` and `DISPLAY_SIZE_CHANGED`.
- Use `SetSnapToPixelGrid(false)` and `SetTexelSnappingBias(0)` deliberately on crisp 1px edge textures when testing across fractional UI scales; verify rendered output at both 1080p and 4K.

## Slanted bars and custom geometry via `MaskTexture`

To build angled/slanted health bars, diamond badges, or custom-shaped minimaps without stretching rectangles:

1. Create a grayscale/alpha mask texture (`local mask = frame:CreateMaskTexture()`) where opaque white (`alpha = 1`) defines the visible shape and transparent (`alpha = 0`) clips it.
2. Call `texture:AddMaskTexture(mask)` (`SimpleTextureAPI:AddMaskTexture` — declared on Retail, Forever, and Classic in `SimpleTextureAPIDocumentation.lua`; Retail and Forever annotate `SecretArguments=AllowedWhenUntainted`).
3. For a `StatusBar`, apply the mask to `bar:GetStatusBarTexture()` and keep `mask` anchored to the full `StatusBar` bounds (not the fill texture's shrinking width) so the slanted edge clips cleanly at both 100% and 15% health.

```lua
local fill = statusBar:GetStatusBarTexture()
local mask = statusBar:CreateMaskTexture()
mask:SetAllPoints(statusBar)
mask:SetTexture("Interface\\AddOns\\MySuite\\Media\\SlantedBarMask.tga", "CLAMPTOBLACKADDITIVE", "CLAMPTOBLACKADDITIVE")
fill:AddMaskTexture(mask)
```

- Keep `CLAMPTOBLACKADDITIVE` wrap modes on masks so edge texels do not bleed at non-integer scales.

## Dark-glass layering and animated fills

- **Layer hierarchy:**
  1. `BACKGROUND` (`sublevel -8`): dark translucent fill (`SetColorTexture(0.06, 0.07, 0.10, 0.78)` or subtle gradient `.tga`).
  2. `BORDER` (`sublevel 0`): pixel-snapped 1px outer border (`4` edge textures sized with `PixelSize(frame, 1)`) plus optional inner rim (`0.08–0.15` alpha).
  3. `ARTWORK`: status fill, class emblem, or custom corner ornament `.tga` (explicitly `DisableDrawLayer` only on addon-owned frames, never Blizzard templates).
  4. `OVERLAY`: spark/shine, text labels, proc glow, and controller focus ring.
- **Animated resource textures:** Use a `Texture` with `SetHorizTile(true)` / `SetVertTile(true)` or `AnimationGroup` (`Translation` / `Alpha` / `FlipBook`) rather than mutating texcoords in a per-frame `OnUpdate` closure that allocates tables. Provide a theme option to disable animations for accessibility/performance.

## Game-ready `.tga` / `.blp` media rules

- Dimensions must be **powers of two** (`16, 32, 64, 128, 256, 512, 1024`) up to `1024x1024`.
- Export **uncompressed 32-bit RGBA `.tga`** (image type `2`) or verified `.blp`—never rename a `.png` to `.tga`.
- Keep all media paths exact-case (`Interface\\AddOns\\MySuite\\Media\\...`) and run `validate-addon.mjs` ([validation script](../../wow-addon-development/scripts/validate-addon.mjs)) to verify `.tga` headers and power-of-two bounds before testing in-game.
