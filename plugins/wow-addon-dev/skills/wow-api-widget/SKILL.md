---
name: wow-api-widget
description: Look up WoW widget object contracts, `CreateFrame`, anchoring, scripts, textures, fonts, animations, and `C_EditMode` schemas across Retail, Forever, and Classic.
---

# WoW Widget API

Resolve targets with [wow-client-targets](../wow-client-targets/SKILL.md) and follow [wow-addon-development](../wow-addon-development/SKILL.md) for UI mock-up, visual fidelity, controller support, and testing gates.

## Target-specific decisions

- Use [native UI composition](../wow-native-ui/SKILL.md) to select addon-owned templates/controls, [UI skinning](../wow-ui-skinning/SKILL.md) to restyle Blizzard windows, and [controller support](../wow-controller-support/SKILL.md) to plan element focus/activation.
- For Forever changes, consult [source evidence](../wow-client-targets/references/SOURCE-EVIDENCE.md) and the [70707 baseline changes](../wow-client-targets/references/FOREVER-70707-CHANGES.md) before applying earlier build guidance.
- This domain also owns **`C_EditMode` and `UISystemVisibilityManager` schemas** alongside `Simple*API` widget methods (including `SimpleFontStringAPI` and `SimpleAnimGroupAPI`).
- Verify frame types, inherited methods, script arguments, protected state, and loaded templates per target; read [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md) and report offline snapshot limits.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete object-method contracts and `C_EditMode` definitions, and [current UI sources](../wow-api-framexml/references/CURRENT-UI-SOURCES.md) before treating a generated ScriptObject name as a `CreateFrame` type. The [historical Retail baseline](references/RETAIL-BASELINE.md) retains older listings as a research aid only:

- [Advanced widgets](references/ADVANCED-WIDGETS.md)
- [Animation widgets](references/ANIMATION-WIDGETS.md)
- [Base widgets](references/BASE-WIDGETS.md)
- [Font widgets](references/FONT-WIDGETS.md)
- [Frame controls](references/FRAME-CONTROLS.md)
- [Frame models](references/FRAME-MODELS.md)
- [Frame specialized](references/FRAME-SPECIALIZED.md)
- [Frame widgets](references/FRAME-WIDGETS.md)
- [Script handlers](references/SCRIPT-HANDLERS.md)
- [Texture widgets](references/TEXTURE-WIDGETS.md)
