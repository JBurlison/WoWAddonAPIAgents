# Choosing and assembling native elements

The [source map](SOURCE-MAP.md) identifies inspected declarations and loading differences. Confirm the particular template and assets against the target before using these patterns. These are construction choices for addon-owned UI, not instructions to modify Blizzard frames globally.

## Choose the smallest useful native component

| Need | Candidate approach | Verify before adopting it |
|---|---|---|
| A standard framed window | A verified panel template, such as the inspected `BasicFrameTemplateWithInset`, or an addon-owned frame with a native border | Which client loads the declaration; title, inset and close-button parent keys; inherited scripts; panel-manager assumptions; minimum dimensions |
| A scalable decorative border | A named NineSlice layout on a dedicated border child | The layout's corners/edges/center, atlas names, texture kit, offsets, frame level and resize behavior; whether the template already owns a NineSlice child |
| A flat background and simple edge | `BackdropTemplate` with an addon-owned backdrop descriptor | The mixin and its load/resize scripts, intended edge art, insets, edge size and scaling; the descriptor is not a NineSlice layout |
| A normal push button | A loaded button template such as `UIPanelButtonTemplate` | State textures/fonts, text padding, height and inherited tooltip/gamepad behavior; the intended action belongs to this button |
| A checkbox, slider, edit box or tab | Its actual control template rather than a button painted to resemble one | Checked/disabled state, keyboard focus, value-change callback, wheel handling, selection and accessibility/narration where supplied |
| Icons and inline artwork | An atlas or texture on an addon-owned region | Asset existence on this build, intended dimensions, UVs, alpha and draw layer; atlas identifiers are not file paths |
| A small fixed group of items | Ordinary frames with explicit anchors or a verified layout mixin | Who owns sizing/anchors, padding, localization and expansion/collapse |
| A long or frequently changing list | A verified ScrollBox view, data provider and scroll bar | Row factory/initializer/resetter contracts, extent, selection and data refresh; do not assume a legacy scroll template has the same contract |

Treat the candidates as source search terms, not aliases you can substitute across clients. Do not copy Blizzard's `[Family]`, `[Game]` or `AllowLoadGameType` selectors into a third-party TOC as if they were portable addon directives. Keep selected-client construction choices in the addon's compatibility layer.

## Borders: NineSlice and backdrops solve different problems

NineSlice composes regions for a layout. At the inspected Forever pin, `NineSliceUtil.ApplyLayout(container, userLayout, textureKit)` consumes a layout table; `ApplyLayoutByName(container, userLayoutName, textureKit)` looks one up. The actual available layout names and overridden offsets must be inspected. Apply a known layout to your own border container; do not mutate the shared `NineSliceLayouts` table or globally replace a named layout to change one window.

`BackdropTemplate` installs `BackdropTemplateMixin` and both load and size-change scripts. Inheriting it is more than obtaining a `SetBackdrop` method. Preserve those handlers when adding behavior; verify the XML script-inheritance mode or use an appropriate additional hook on an addon-owned frame. A plain frame should not be assumed to expose the mixin's methods.

Do not stack a second border over a template's existing border unless the design calls for it. Inspect corners and edges at both minimum and maximum sizes. Native artwork may have transparent padding, so the visible border and the region's rectangle can differ. Insets must keep content and hit targets clear of the artwork.

## Buttons, fonts and textures

Preserve hover, pressed, disabled and selected cues. Changing only the normal texture commonly leaves an inconsistent disabled or pushed state. Avoid clearing every texture region: some regions convey state or serve as hit-target decoration. A taller stock button may need a different verified template or custom state art rather than stretching its original textures.

Use the loaded client's font objects/styles as starting points. Assign a font to your own FontString or create an addon-owned font object for changes; editing a shared `GameFont...` object can affect unrelated UI. Verify the actual font name, fallback glyph coverage, wrapping, truncation and disabled contrast. Localized labels need room to grow.

For an atlas, verify the name in the selected client and the actual `SetAtlas` signature, including whether requesting atlas size changes your layout. For a file texture, verify its path or file ID, crop and aspect ratio. `SetTexCoord` crops a texture; vertex color tints its existing pixels. Neither operation reconstructs arbitrary artwork. Reference available native assets in the client instead of vendoring Blizzard artwork into the plugin.

## Layout, scaling and lists

Give each dimension and anchor one owner. A layout mixin that recomputes child positions will undo ad hoc `SetPoint` calls; change its supported padding/order/extent inputs or use a wrapper instead. Frame strata, frame level, draw layer and sublevel all affect composition; do not compensate for a wrong hierarchy by assigning huge frame levels.

Measure at several UI scales and resolutions. One UI unit is not necessarily one physical pixel. The inspected Retail and Forever `PixelUtil.lua` files mark `SetPoint`, `SetSize`, `SetWidth` and `SetHeight` helpers deprecated in favor of native `SetRoundLayoutToNearestPixel`; the inspected Classic file does not contain that replacement/deprecation guidance. Verify the selected widget's native method before adopting it. Do not apply modern rounding helpers recursively to Blizzard-owned trees or assume identical support across targets.

For pooled or virtualized rows, split one-time construction from per-assignment binding. Create decoration and attach stable handlers once; update text, icon, selection and the row's current data when reassigned. Reset data references, temporary visual state and callbacks on release according to the pool's contract. A click handler must consult current row data rather than an earlier captured record. Do not create a new border or hook on every refresh, cache only currently visible rows as the entire data set, or mix legacy HybridScrollFrame code with ScrollBox callbacks.

## Small composition example

This original wiring example creates an addon-owned decorative panel and a stock action button. It assumes the target adapter has verified and loaded `BackdropTemplate` and `UIPanelButtonTemplate`, the native methods, and the descriptor's texture assets. `backdrop` is your addon-owned table specifying the selected `bgFile`, `edgeFile`, `edgeSize` and `insets`; it is not a global Blizzard layout. It performs no protected gameplay action and has not been run in a game client.

```lua
local function CreateNativePanel(parent, backdrop, localizedButtonText)
    local panel = CreateFrame("Frame", nil, parent, "BackdropTemplate")
    panel:SetSize(320, 160)
    panel:SetPoint("CENTER")
    panel:SetBackdrop(backdrop)
    panel:SetBackdropColor(0.08, 0.08, 0.08, 0.95)
    panel:SetBackdropBorderColor(0.65, 0.65, 0.65, 1)

    local done = CreateFrame("Button", nil, panel, "UIPanelButtonTemplate")
    done:SetSize(120, 24)
    done:SetPoint("BOTTOM", 0, 16)
    done:SetText(localizedButtonText)
    done:SetScript("OnClick", function() panel:Hide() end)
    return panel
end
```

The panel deliberately keeps the inherited backdrop resize handler. If adding resizing, dragging, ESC handling, tooltips or persistence, verify and implement those separately rather than treating decoration as a complete window-management contract. Integrate through the addon's normal initialization and expose a local reference to its UI controller. Before shipping, complete the required [controller assessment](../../wow-controller-support/SKILL.md): the click handler alone does not establish controller reachability, focus indication or back/close navigation.

## Verify the result

- Open, close, reopen, resize and change UI scale; check border alignment, clipping and overlapping hit targets.
- Exercise hover, pressed, disabled, checked/selected, keyboard focus and applicable gamepad input. Record per-client limitations, explicit user exclusions and unperformed controller checks; controller assessment is required even when not mentioned in the request.
- Test long/localized labels, empty and overflowing lists, row recycling, selection after sorting, tooltip ownership and missing assets.
- Check loading and actual interaction on each selected client, including combat transitions if the UI interacts with protected objects. Record Lua errors and distinguish an unsupported capability from a rendering defect.
- Compare screenshots to the accepted design using [visual fidelity](../../wow-addon-development/references/VISUAL-FIDELITY.md). Use the already selected [testing route](../../wow-addon-development/SKILL.md); simulator appearance alone is not client acceptance.
