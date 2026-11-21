---
name: wow-controller-support
description: Design and validate controller/gamepad support for addon UI, native controls, radial menus, and reskinned Blizzard frames across Retail, Forever, and Classic.
---

# Consider controller interaction for every UI element

Apply this skill whenever creating or changing visible UI, including native templates, reskins, and decorative regions (which must not obscure focus or intercept input). Record interactions and target limits without altering user bindings or overriding explicit user exclusions.

## Triage scope by UI surface

| Surface type | Native ownership & required work |
|---|---|
| **Stock Blizzard Settings / native dialogs** | Blizzard owns navigation (`Blizzard_Settings_Shared` / native templates); verify registration, stable focusable labels, and non-blocking custom canvas controls. |
| **Retail / Classic custom addon frame** | `Blizzard_GamepadSmartNavigation` is **Forever (`camelot`) only**. Use cursor-accessible controls or verified addon-owned focus/back paths (`OnGamePadButtonDown`, `Escape`/close, `SetPropagateKeyboardInput`), and document target limits. |
| **Forever custom controller window / radial wheel** | Follow full workflow below: trace `SmartNavigation` / `GamepadSharedUtility`, [focus acquisition](references/FOCUS-ACQUISITION.md), [interaction lifecycle](references/INTERACTION-GUIDE.md), and [radial menus](references/RADIAL-MENUS.md). |

## Workflow

1. Resolve [client targets](../wow-client-targets/SKILL.md) and inspect [source map](references/SOURCE-MAP.md) (Forever's `C_GamepadUI`, `C_GamepadTargeting`, `C_InputInterfaceStyle`, and `SmartNavigation` are not portable to Retail/Classic).
2. Add controller acceptance criteria to requirements/notes before coding (reachability, focus cues, primary/back actions, tabs/scrolling/text entry, disabled states). Follow accepted [UI design & testing choices](../wow-addon-development/references/UI-DESIGN-AND-TESTING.md).
3. Establish unfocused window entry using [focus acquisition and diagnostics](references/FOCUS-ACQUISITION.md) (a visual focus outline alone cannot capture gamepad input).
4. Implement focus restoration, input-mode glyph updates, recycled-control identity checks, and editor lifetime via [interaction guide](references/INTERACTION-GUIDE.md).
5. For radial wheels or protected spell wheels, read [radial menus](references/RADIAL-MENUS.md).
6. Validate per-client cases and mark untested hardware checks **not run** rather than inferring support from mouse clicks or static inspection.

For contracts and loading, query [wow-api-index](../wow-api-index/SKILL.md), [settings/input](../wow-api-settings-system/SKILL.md), [widget APIs](../wow-api-widget/SKILL.md), [FrameXML](../wow-api-framexml/SKILL.md), and [Lua/security](../wow-api-lua-environment/SKILL.md).
