---
name: wow-api-xml-schema
description: Look up the World of Warcraft XML schema — all XML elements,
  attributes, types, defaults, and inheritance used to define UI frames,
  textures, fonts, and animations in addon XML files. Covers Ui,
  LayoutFrame, Frame and all subtypes (Button, EditBox, Slider, StatusBar,
  Cooldown, etc.), Texture, MaskTexture, Line, FontString, Font,
  FontFamily, AnimationGroup, Animation and all subtypes (Alpha, Scale,
  Translation, Path, Rotation), plus shared elements like Anchors, Layers,
  Scripts, KeyValues, Color, Gradient, TexCoords, and Shadow. Use
  when writing or reading WoW addon XML files, defining frames in XML, setting
  up XML templates, or understanding XML attribute-to-API mappings. Select
  Retail, Forever, or Classic with wow-client-targets before using historical
  listings.
---

# api xml schema

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify the selected branch XML schema, templates, includes, script handlers and client load conditions. A valid XML element in Retail may not be available in another client.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned per-client schemas and template loading guide](../wow-api-framexml/references/CURRENT-UI-SOURCES.md) for current evidence. XML type inheritance, template inheritance and Lua mixins must be checked separately.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [XML ANIMATIONS](references/XML-ANIMATIONS.md)
- [XML FONTS](references/XML-FONTS.md)
- [XML FOUNDATION](references/XML-FOUNDATION.md)
- [XML FRAME TYPES](references/XML-FRAME-TYPES.md)
- [XML REGIONS](references/XML-REGIONS.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
