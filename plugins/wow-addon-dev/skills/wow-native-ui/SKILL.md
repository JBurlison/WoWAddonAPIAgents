---
name: wow-native-ui
description: Build addon-owned windows and controls using Blizzard's native UI templates, buttons, borders, NineSlice, backdrops, fonts, textures, atlases, and scrolling lists. Use when choosing or assembling native-looking UI for Retail, Forever, or Classic progression; use wow-ui-skinning for restyling existing Blizzard windows.
---

# Build with native UI elements

Use native controls and artwork when they match the requested appearance. Start with [client targets](../wow-client-targets/SKILL.md): resolve each selected client and pin its branch before choosing templates. A template in the source tree may belong to another game family, depend on another addon, or have client-specific overrides.

For new visible UI, follow the [design and mock-up choice](../wow-addon-development/references/UI-DESIGN-AND-TESTING.md) before production implementation, honoring an already accepted design or choice.

1. Identify the component and ownership: an addon-owned window, ordinary control, reusable list row, or protected action control. Use [element selection](references/ELEMENTS.md) for the practical choices. Reskinning an existing CharacterFrame, spellbook, or other Blizzard window belongs in [UI skinning](../wow-ui-skinning/SKILL.md).
2. Find the native example, its XML declaration and Lua mixins, then trace the owning TOC, includes, client selectors, dependencies and initialization. Record the resolved template, expected parent keys, required scripts, asset identifiers and verified client/build. The [source map](references/SOURCE-MAP.md) supplies dated starting points, not a universal template catalog.
3. Preserve the chosen template's behavior. Reuse its child references, normal/highlight/pushed/disabled state handling, resizing and layout lifecycle. Do not replace inherited setup scripts or alter shared fonts/layout tables to style one frame. Add your own children or use an addon-owned wrapper when composition is sufficient.
4. Choose a fallback separately for each target. A verified primitive composition may replace an unavailable convenience template; otherwise report the component unsupported for that target. Function presence does not prove matching arguments, template loading or addon permission.
5. Test the visible states and interactions listed in the element guide, using the existing [UI design and testing choices](../wow-addon-development/references/UI-DESIGN-AND-TESTING.md) and [visual fidelity guide](../wow-addon-development/references/VISUAL-FIDELITY.md). Honor an accepted custom design; a stock button or border is not automatically a visual match. Reuse the user's established testing choice.

For exact native methods and script contracts, query [widget APIs](../wow-api-widget/SKILL.md). For mixins, pools and load ownership, use [FrameXML](../wow-api-framexml/SKILL.md); for XML inheritance and script composition use [XML schema](../wow-api-xml-schema/SKILL.md). These references complement this construction workflow rather than replace client verification.

Keep ordinary decoration separate from protected gameplay behavior. Native artwork does not grant permission to move protected frames, set restricted attributes, perform actions in combat, or inspect secret values. Apply the selected client's verified restrictions. Report source verification, simulator results and in-game results separately; disclose stale evidence when current sources cannot be checked.
