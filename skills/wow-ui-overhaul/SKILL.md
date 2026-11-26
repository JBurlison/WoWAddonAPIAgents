---
name: wow-ui-overhaul
description: Build full modular WoW HUD and total-conversion UI overhauls (unit frames, cast bars, action bars, nameplates, minimap, bags, chat, tooltips, custom geometry, 4K scaling) across Retail, Forever, and Classic.
---

# Full HUD and total-conversion UI overhauls

Use this skill when building or maintaining a modular, multi-system HUD overhaul (like AscendUI or custom UI suites) across Retail, Forever, and Classic progression.

- For standalone addon dialogs, menus, or `ScrollBox` panels, use [wow-native-ui](../wow-native-ui/SKILL.md).
- For restyling existing Blizzard windows (Character, SpellBook, Professions), use [wow-ui-skinning](../wow-ui-skinning/SKILL.md).
- For full HUD replacement or custom-art total-conversion suites, follow this skill alongside [wow-addon-development](../wow-addon-development/SKILL.md) (options, localization, mock-up, visual fidelity, controller support, and testing gates).

## Workflow

1. **Resolve targets and inspect real Blizzard files:** Confirm `retail`, `forever`, `classic`, or `all` with [wow-client-targets](../wow-client-targets/SKILL.md). Query generated APIs via `wow-api-index` (`query.mjs`) and inspect pinned Blizzard templates/TOCs via `fetch-source.mjs` before hiding or replacing any native frame.
2. **Design the modular suite first:** Separate the theme token registry, module lifecycle, layout/mover engine, and per-client adapters using [suite architecture](references/SUITE-ARCHITECTURE.md). Suppress replaced Blizzard frames via a dedicated hidden `Hider` frame or `RegisterStateDriver`, never destructive script wipes.
3. **Plan custom art, geometry, and 4K scaling:** Use [custom art and scaling](references/CUSTOM-ART-AND-SCALING.md) for `PixelUtil` pixel-snapped borders, `MaskTexture` slanted/angled bars, layered dark-glass styling, animated textures, and power-of-two 32-bit `.tga`/`.blp` assets.
4. **Implement HUD modules with combat & Secret Value safety:**
   - [Unit frames and cast bars](references/UNIT-FRAMES-AND-CASTBARS.md): `SecureUnitButtonTemplate`, `SecureGroupHeaderTemplate`, `RegisterUnitWatch`, and Secret-Value-safe widget sinks on Retail/Forever.
   - [Action bars](references/ACTION-BARS.md): `SecureActionButtonTemplate`, `RegisterStateDriver` paging, range/OOM tinting, proc glows, compact keybinds, and secondary utility bars.
   - [Nameplates](references/NAMEPLATES.md): `C_NamePlate`, `IsForbidden()` checks, secure hitbox preservation, and zero-allocation recycling.
   - [Bags, chat, minimap, and tooltips](references/BAGS-CHAT-MINIMAP-TOOLTIPS.md): secure bag item buttons, masked minimaps, channel-colored chat edit boxes, `TooltipDataProcessor` vs. Classic hooks, and throttled `NotifyInspect`.
5. **Validate statically and visually:** Run `validate-addon.mjs` ([validation script](../wow-addon-development/scripts/validate-addon.mjs)) to catch TOC, case-sensitivity, `.tga` dimension/format, and Lua 5.1/taint issues, then run [visual fidelity](../wow-addon-development/references/VISUAL-FIDELITY.md) and [controller support](../wow-controller-support/SKILL.md) checks before claiming completion.
