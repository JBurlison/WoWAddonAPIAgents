---
name: wow-api-widget
description: Curated guide to the WoW Widget API (Retail). Focuses on core
  widget types, common methods, and patterns for CreateFrame, anchoring,
  scripts, textures, fonts, animations, and UI controls. Select Retail, Forever,
  or Classic with wow-client-targets before using historical listings.
---

# api widget

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify frame type/method availability, inherited methods, widget script arguments, protected state and loaded templates. Prefer simple verified primitives when a specialized widget is unavailable.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [ADVANCED WIDGETS](references/ADVANCED-WIDGETS.md)
- [ANIMATION WIDGETS](references/ANIMATION-WIDGETS.md)
- [BASE WIDGETS](references/BASE-WIDGETS.md)
- [FONT WIDGETS](references/FONT-WIDGETS.md)
- [FRAME CONTROLS](references/FRAME-CONTROLS.md)
- [FRAME MODELS](references/FRAME-MODELS.md)
- [FRAME SPECIALIZED](references/FRAME-SPECIALIZED.md)
- [FRAME WIDGETS](references/FRAME-WIDGETS.md)
- [SCRIPT HANDLERS](references/SCRIPT-HANDLERS.md)
- [TEXTURE WIDGETS](references/TEXTURE-WIDGETS.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
