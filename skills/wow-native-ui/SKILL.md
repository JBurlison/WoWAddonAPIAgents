---
name: wow-native-ui
description: Build addon-owned windows and controls using Blizzard UI templates, borders, NineSlice, buttons, MenuUtil, ScrollBox, textures, and atlases. Use wow-ui-skinning for Blizzard frames.
---

# Build with native UI elements

Resolve targets with [wow-client-targets](../wow-client-targets/SKILL.md) and follow [wow-addon-development](../wow-addon-development/SKILL.md) for baseline UI mock-ups, visual fidelity, options, localization, and controller gates. Reskinning Blizzard-owned frames (like CharacterFrame or SpellBook) belongs in [UI skinning](../wow-ui-skinning/SKILL.md); full modular HUD/total-conversion suites belong in [UI overhaul](../wow-ui-overhaul/SKILL.md).

1. **Choose component and ownership:** Select an addon-owned panel, ordinary control, dropdown (`MenuUtil`), scrolling list (`ScrollBox`), or protected action control using [element selection](references/ELEMENTS.md).
2. **Trace the native template:** Locate the XML declaration, Lua mixins, owning TOC, `[Family]`/`[Game]` selectors, and dependencies at the pinned commit. The [source map](references/SOURCE-MAP.md) supplies dated starting points, not a universal catalog.
   - For Forever gold dialogs or Edit Mode art, see [Forever native artwork](references/FOREVER-NATIVE-ART.md) (resolve native assets rather than tinting another client's art).
   - For radial overlays, see [radial composition](../wow-controller-support/references/RADIAL-MENUS.md).
3. **Preserve template behavior:** Reuse child references, state textures, resizing, and layout lifecycle. Do not overwrite inherited setup scripts or mutate shared global fonts/tables to style one addon window.
4. **Assess controller paths:** Apply [controller support](../wow-controller-support/SKILL.md) to interactive controls and verify focus/activation rather than relying on template inheritance alone.
5. **Fallback per target:** Substitute a verified primitive composition where a convenience template is absent, or report the component unsupported for that client.
6. **Test visually and functionally:** Validate states, interactions, and custom-art composition per [UI design & testing](../wow-addon-development/references/UI-DESIGN-AND-TESTING.md) and [visual fidelity](../wow-addon-development/references/VISUAL-FIDELITY.md).

For widget method contracts, query [widget APIs](../wow-api-widget/SKILL.md); for mixins/pools/load paths, use [FrameXML](../wow-api-framexml/SKILL.md); for XML schema inheritance, use [XML schema](../wow-api-xml-schema/SKILL.md). Keep ordinary styling separate from protected actions, combat lockdown, and secret values.
