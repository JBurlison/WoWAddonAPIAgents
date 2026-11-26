---
name: wow-ui-skinning
description: Reskin and customize existing Blizzard frames (character screen, paper doll, spellbook, tabs, lists, buttons) as standalone addons without framework dependencies.
---

# Skin Blizzard UI without a framework dependency

Use this skill for modifying Blizzard-owned windows; for addon-owned panels, use [wow-native-ui](../wow-native-ui/SKILL.md); for full modular HUD/total-conversion suites, use [wow-ui-overhaul](../wow-ui-overhaul/SKILL.md). Follow [wow-addon-development](../wow-addon-development/SKILL.md) for options, localization, mock-up, visual fidelity, and testing baselines, and preserve Blizzard's localized labels.

## Establish the surface and target

Resolve targets with [wow-client-targets](../wow-client-targets/SKILL.md) and trace the window's owning TOC, XML/Lua variants, construction, update points, and data binding at the pinned commit. Use [character and spellbook recipes](references/NATIVE-WINDOW-RECIPES.md) as starting points, not universal object paths.

## Implement a small skin layer

- Inventory focus/controller owners via [controller support](../wow-controller-support/SKILL.md) before hiding or moving regions so navigation, hints, and modal return keep working.
- Follow [skinning architecture](references/SKINNING-ARCHITECTURE.md) to separate theme tokens, client adapters, per-window modules, and combat-deferred dirty queues.
- Style existing controls in place without replacing scripts, hit targets, or action attributes; separate one-time setup from state refreshes (especially for pooled rows).
- Prefer narrow `hooksecurefunc` post-hooks or documented callbacks (`hooksecurefunc` does not grant protected access or suppress combat lockdown).
- Handle NineSlice pieces, borders, masks, icons, selected tabs, and disabled states individually — never strip all textures or hide whole draw layers blindly.
- Expose per-module opt-outs so conflicting skin addons do not fight over the same frames.
- Consult [ElvUI research patterns](references/ELVUI-PATTERNS.md) strictly for architectural study; reimplement with verified Blizzard APIs (`E`, `StripTextures`, `SetTemplate`, etc. do not exist natively).

## Verify visual and functional behavior

Test first open, reopen, reload, late loading, tab/search transitions, empty/populated states, pooled scroll recycling, UI scale, localization, combat transitions, and disable/re-enable per [client acceptance](../wow-addon-development/references/CLIENT-VALIDATION.md). Report unresolved client surfaces instead of copying another client's skin.
