---
name: wow-api-xml-schema
description: Look up WoW XML UI schema elements, attributes, templates, anchors, layers, scripts, fonts, and animations for addon `.xml` files.
---

# WoW XML Schema

Resolve targets with [wow-client-targets](../wow-client-targets/SKILL.md) and follow [wow-addon-development](../wow-addon-development/SKILL.md) for UI mock-up, visual fidelity, and testing baselines.

## Target-specific decisions

Verify the selected branch XML schema, templates, includes, script handlers, and client load conditions via [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md) — a valid Retail XML element may not exist in Classic or Forever.

## Detailed lookup material

Use the [pinned per-client schemas and template loading guide](../wow-api-framexml/references/CURRENT-UI-SOURCES.md) for current `UI.xsd` evidence. XML inheritance, template inheritance, and Lua mixins must be checked separately. The [historical Retail baseline](references/RETAIL-BASELINE.md) retains older reference prose as a research aid only:

- [XML animations](references/XML-ANIMATIONS.md)
- [XML fonts](references/XML-FONTS.md)
- [XML foundation](references/XML-FOUNDATION.md)
- [XML frame types](references/XML-FRAME-TYPES.md)
- [XML regions](references/XML-REGIONS.md)
