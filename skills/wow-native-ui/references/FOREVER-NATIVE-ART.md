# Forever native dialog artwork

Use this when matching Forever's native gold dialogs, including a user-provided HUD Edit Mode reference. It is a source map for composition, not a universal theme requirement: preserve the user's selected design and inspect other native window families separately.

## Evidence and scope

Reviewed **2026-11-08**, Gethe/wow-ui-source `forever` commit **`9dc84f0d3bbae1768ac3405b3716000bd93eda06`**, [version 1.60.1.70862](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/version.txt). Interface **16001** is derived, not observed in a running client. This narrow UI review does not advance `wow-client-targets/references/targets.json` or regenerate its declaration catalogs. Re-resolve and inspect the selected build before using these observations for a different task.

Source declarations and the loading references below were inspected. Actual addon construction, asset pixels, native font rendering, combat/access behavior, controller input and in-game visual comparison were **not run**. A template that references another template does not establish that the entire inheritance chain is available in an arbitrary addon environment.

## Shell, background and title

[Shared/EditModeManager.xml](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_EditMode/Shared/EditModeManager.xml) composes:

- `DialogBorderTranslucentTemplate` for its border/background.
- `GameFontHighlightLarge` for its title.
- `UIPanelCloseButton` for its close control, additionally inheriting an Edit Mode-specific unsaved-changes template.

Reuse the ordinary visual components on an addon-owned frame; do not inherit the entire Edit Mode manager or its save/layout behavior just to obtain its art.

[Shared/Dialog/DialogTemplates.xml](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Shared/Dialog/DialogTemplates.xml) defines `DialogBorderNoCenterTemplate` as a `NineSlicePanelTemplate` with `layoutType = "Dialog"`. `DialogBorderTranslucentTemplate` adds a black `Bg` region at alpha **0.8**, inset **7** units on each side. That reference background is a native color region, not a texture that needs to be recreated.

The same file offers textured alternatives: `DialogBorderTemplate` tiles `Interface\DialogFrame\UI-DialogBox-Background`; `DialogBorderDarkTemplate` tiles `Interface\DialogFrame\UI-DialogBox-Background-Dark`. Choose the one matching the requested reference rather than silently substituting an opaque or textured panel.

The `Dialog` layout in [Mainline/NineSliceLayouts.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Mainline/NineSliceLayouts.lua) references:

| Regions | Native atlas identifiers |
|---|---|
| Corners | `UI-Frame-DiamondMetal-CornerTopLeft`, `UI-Frame-DiamondMetal-CornerTopRight`, `UI-Frame-DiamondMetal-CornerBottomLeft`, `UI-Frame-DiamondMetal-CornerBottomRight` |
| Horizontal edges | `_UI-Frame-DiamondMetal-EdgeTop`, `_UI-Frame-DiamondMetal-EdgeBottom` |
| Vertical edges | `!UI-Frame-DiamondMetal-EdgeLeft`, `!UI-Frame-DiamondMetal-EdgeRight` |

Use the selected client's native template/atlas resolution. A shared identifier or a `Mainline` source folder is not proof that Forever displays Retail's pixels; do not infer a gold tint is required from the identifier's name. Source references alone do not establish the final asset colors.

## Buttons and sizing pitfalls

[Mainline/SharedUIPanelTemplates.xml](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Mainline/SharedUIPanelTemplates.xml) contains the following declarations:

| Component | Art/state references | Composition constraint |
|---|---|---|
| `UIPanelCloseButtonNoScripts` → `UIPanelCloseButton` | `RedButton-Exit`, `RedButton-exit-pressed`, `RedButton-Exit-Disabled`, `RedButton-Highlight` | Preserve all inherited states; use the appropriate close behavior on the addon-owned frame. |
| `UIPanelButtonTemplate` | Inherits `UIPanelButtonNoTooltipTemplate` and adds `UIPanelButtonMixin` tooltip handlers | The base is declared in [SecureUIPanelTemplates.xml](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/SecureUIPanelTemplates.xml), loaded by SharedXML before the family templates. It composes `UI-Panel-Button-Up` left/right pieces of 12 units each plus a stretchable middle, and native state handlers/fonts. This is a compact-control candidate; the filename alone does not make every inheriting button protected. Recheck inherited scripts and runtime state. |
| `UIGoldBorderButtonTemplate` | `Interface\Common\dark-goldframe-button`, `dark-goldframe-button-pressed`, `Interface\Buttons\UI-Silver-Button-Highlight`; native normal/highlight/disabled font styles | Has a `$parentDetails` anchor. It is not a drop-in generic key/button template for a parent without that named frame. Reuse suitable native art with addon-owned geometry or select another verified control. |
| `UIPanelGoldButtonTemplate` | `Interface\Buttons\UI-DialogBox-goldbutton-{up,down,disabled}-{left,middle,right}`; `UIPanelButtonHighlightTexture` | Its left/right pieces are **64/32** units wide. Do not squeeze the unmodified template into a small letter key; verify a compact native asset or deliberately compose/crop native state art and validate every state. Preserve its show/enable/disable/release lifecycle. |

[Camelot/SharedUIPanelTemplates.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Camelot/SharedUIPanelTemplates.lua) sets `UIPanelCloseButtonDefaultAnchorsMixin` to **28×28**, anchored `TOPRIGHT` at **(0, 3)**. This belongs to the default-anchor mixin, not every instance of `UIPanelCloseButton`. The same file changes side-tab icon offsets. Do not apply these offsets globally to every close control or copy Retail dimensions unexamined.

## Native controller prompt artwork

At this same source pin, [Shared/InputIcons/InputIconTexture.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Shared/InputIcons/InputIconTexture.lua) declares native atlas sets. Xbox uses `gamepad-xbox1-*`, PlayStation uses `gamepad-ps-*`, and Nintendo uses `gamepad-switch-128x-*`; normal states end in `-normal`. PlayStation Cross is spelled `buttoncrox` in its atlas ID. The native Generic set currently uses Xbox artwork. `gamepad-symbols-plus` supplies chord separators. Use actual Texture:SetAtlas images when the design calls for controller button overlays; bracketed letters or words such as Cross are not equivalent artwork.

`InputDeviceIconSetManager.lua` reads mapped device `labelStyle` as **Letters, Shapes, Reverse** (and Generic), not necessarily brand names. Resolve the effective binding's physical PAD token before choosing the family image. Nintendo A-confirm changes the physical binding (PAD2), not just a label on PAD1. Manual addon preferences must not mutate the global native icon-set manager. SharedXML's TOC loads GamepadConstants plus this manager, Lua and XML. Verify the actual client renderer's atlases; source declarations alone do not prove pixels are present.

Native `InputIconTextureMixin:ApplyTextureLayout` expands texture bounds by 5 units on each side when `C_Texture.GetAtlasInfo` reports the newer 76x75 canvas. Preserve that compensation in addon-owned overlays to avoid undersized symbols. Reserve layout space for image/chord bounds and label text separately. Native `EditBox:SetTextInsets(left,right,top,bottom)` controls caret/text margins; a ScrollFrame's outer inset or clipping alone is not an edit-box text inset.

## Addon identity icons and native menus

Original suite/project branding can use addon-owned artwork alongside native window assets. At this pin, [Blizzard_AddOnList/AddonList.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_AddOnList/AddonList.lua) reads TOC `IconTexture` and renders a 20-unit inline texture in the title. [Minimap/Mainline/AddonCompartment.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_Minimap/Mainline/AddonCompartment.lua) uses the same metadata for a 16-unit minimap-menu image when `AddonCompartmentFunc` is supplied. The Minimap TOC loads this family implementation plus Camelot overrides. Source inspection and UIForever 70450 rendering/click tests on 2026-11-08 verified an original 128x128 uncompressed 32-bit RGBA TGA for both native menus; current-client/hardware acceptance remains separate.

`AddonCompartmentFunc` is looked up as `_G[metadataValue]`, not a dotted namespace path. Define a uniquely named global handler; the native menu passes addon name and button name. Keep ordinary Options opening guarded for combat/blockers and hand controller input to the existing owned UI/neutral gate. Native menu registration/navigation remains native; adding a glyph alone is not focus registration. Verify actual native menu click behavior, not only the callback helper.

Keep large source/store PNGs outside the shipped addon; include the game texture and validate its TOC path and package bytes. For a suite, preserve a reusable frame/mark and vary the center by module. Native TOC `Group` is separate from visual branding: the AddOns-list source requires an override to match the actual parent addon name, so do not invent a marketing-group value when no parent addon exists.

## Loading and validation

[Blizzard_SharedXML.toc](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Blizzard_SharedXML.toc) loads family NineSlice layouts, [Camelot offset overrides](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_SharedXML/Camelot/NineSliceLayoutOverrides.lua) for Camelot, then `NineSlice.lua`. It also loads family SharedUIPanelTemplates Lua/XML, the Camelot Lua override, and `Shared/Dialog/DialogTemplates.xml`. The Camelot NineSlice overrides target specific metal-corner atlas IDs; do not assume they change every layout.

[Blizzard_EditMode.toc](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_EditMode/Blizzard_EditMode.toc) loads the reference manager XML and declares dependencies including `Blizzard_UIPanelTemplates`. Its native use is evidence for that owner's composition, not proof of an addon-facing Edit Mode extension API.

For delivery, reference the client's assets rather than vendoring Blizzard artwork. A source mirror supplies Lua/XML asset identifiers; those files do not supply the client texture pixels. Label CSS/static approximations honestly, and retain native visual acceptance until rendered in a suitable client or simulator. Check frame corners/insets, small and long buttons, normal/highlight/pushed/disabled/controller-focus states, font glyph coverage and UI scale. Preserve effective controller-binding prompts and avoid decorative overlays intercepting input. See [element selection](ELEMENTS.md) and [controller support](../../wow-controller-support/SKILL.md).
