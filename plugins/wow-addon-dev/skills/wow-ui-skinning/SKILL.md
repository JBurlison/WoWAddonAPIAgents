---
name: wow-ui-skinning
description: Reskin and deeply customize Blizzard's existing windows and controls, including the character screen, paper doll, spellbook, tabs, lists, and item buttons. Use for standalone addon themes that preserve native behavior across selected WoW clients; ElvUI is an optional research example, not a dependency.
---

# Skin Blizzard UI without a framework dependency

Use this skill when the requested interface already belongs to Blizzard. For new addon-owned windows or controls with native styling, use [wow-native-ui](../wow-native-ui/SKILL.md). For the overall design and testing choices, follow [wow-addon-development](../wow-addon-development/SKILL.md), honoring answers already given.

## Establish the surface and target

Resolve Retail, Forever, Classic progression, or their requested combination with [wow-client-targets](../wow-client-targets/SKILL.md). Identify the exact window, intended visual change, and behaviors to retain. A character-frame redesign can alter ornament, spacing, fonts and layout while preserving equipment interaction, tooltips, tabs and the model. A request to replace those behaviors is a larger functional feature, not an incidental skin change.

Pin the selected client's source, then trace its owning TOC, selected XML/Lua variants, construction, update methods and data binding. Confirm frame and region identities from source and the actual client. A similarly named frame on another client is not a compatibility contract. Use the [character and spellbook recipes](references/NATIVE-WINDOW-RECIPES.md) as researched entry points, not universal object paths.

## Implement a small skin layer

Every reskin must consider [controller support](../wow-controller-support/SKILL.md). Inventory the existing focus/navigation owner, controller targets and action hints before moving or hiding regions. Preserve their roles when changing the art; check that selection/focus remains visible and that modal back/close and recycled-control navigation still work. Keep target-specific gaps and any explicit user exclusion in the task record.

Read [skinning architecture](references/SKINNING-ARCHITECTURE.md) for module boundaries, load timing, repeated updates, pooling, safe hooks and disable behavior. Keep theme tokens separate from client adapters and per-window modules. Enable only the modules the user requested.

- Style existing controls where that meets the design. Keep their scripts, action attributes, hit targets, keyboard/gamepad behavior and state indicators. Add addon-owned decoration only when its layering and input behavior are understood.
- Separate one-time setup from state refresh. A frame may survive many different spell, item or list-row bindings. Repaint when Blizzard changes state; do not repeatedly create frames or install hooks.
- Prefer a narrow post-hook or documented callback at the actual visual update point. `hooksecurefunc` does not grant protected access or make mutations within its callback safe. Verify the selected client's hook and widget contracts through [FrameXML](../wow-api-framexml/SKILL.md) and [widget APIs](../wow-api-widget/SKILL.md).
- Treat NineSlice pieces, border art, masks, icon state, selected tabs and disabled states separately. Do not recursively strip every texture, hide every region, replace existing scripts, or disable a whole draw layer just to remove an ornament.
- Defer restricted mutations while in combat; re-resolve the current object and desired state afterward. Do not cache restricted values or assume an unprotected parent makes every child safe. Apply secret-value and taint rules for the verified client and operation.
- If another addon already skins the same surface, expose a per-module opt-out or explicitly coordinate ownership. Avoid competing hooks that continually undo each other's changes.

Read [ElvUI research patterns](references/ELVUI-PATTERNS.md) when a complex skin needs architectural examples. Reimplement the needed behavior with verified Blizzard APIs and your own code. `E`, `S`, `StripTextures`, `Kill`, `SetTemplate`, `CreateBackdrop`, `FontTemplate`, and similar ElvUI extensions are not native methods available to a standalone addon. Do not add ElvUI to dependencies or copy its media/code merely because it demonstrates a design.

## Verify visual and functional behavior

Test the window before and after customization: first open, reopen, reload, late addon loading, tab/page/search transitions, empty/populated data, changing items/spells, UI scales, localization, hover/focus/disabled/selected states, and input paths the client supports. For pooled UI, scroll far enough to recycle controls and change their backing data. Compare screenshots with the chosen design and verify the underlying game interactions still work.

Exercise combat entry/exit and disable/re-enable only through the selected client's supported operations. Record first-open and combat taint/Lua errors separately from visual defects. Use the existing [client acceptance checklist](../wow-addon-development/references/CLIENT-VALIDATION.md) and the task's chosen runtime or simulator route. A source review or simulator screenshot does not certify native-window security, persistence, or in-game behavior.

Deliver the selected targets, source pins, adapted modules, changed visual regions, retained interactions, unresolved surfaces and actual test results. If the source or runtime structure cannot be verified, leave that client/module unsupported or deferred rather than silently applying another client's skin.
