---
name: wow-controller-support
description: Design and review controller/gamepad support for every addon UI element, native control, and reskinned Blizzard window across selected Retail, Forever, and Classic progression clients. Use for focus navigation, input ownership, current-binding prompts, cursor interaction, modal and edit-box behavior, scrolling, and controller validation.
---

# Consider controller interaction for every UI element

Apply this skill whenever creating or changing visible addon UI, including native templates and skins. Consider decorative elements too: they must not obscure focus or intercept input. Required consideration means recording the interaction and target-specific limitation; it does not mean forcing a controller mode, adding an unrelated feature, or overriding an explicit user decision.

1. Resolve [client targets](../wow-client-targets/SKILL.md), pin each branch, and identify the UI owner and load path. Use the [source map](references/SOURCE-MAP.md) as dated evidence, then verify the actual API, scripts, security and loading for the task. Forever's native navigation machinery is not a portable Retail/Classic API.
2. Add controller acceptance criteria to the existing requirements/design before implementation. For each element specify reachability, focus indication, primary/secondary action, back, tab/page/scroll behavior, and any disabled or unsupported state. Follow the existing [design and testing choices](../wow-addon-development/references/UI-DESIGN-AND-TESTING.md); do not reopen accepted choices solely because this skill was selected.
3. Choose a verified native integration, addon-owned ordinary-UI navigation, or controller-driven cursor interaction for each target. A cursor fallback must still reach every supported action. If no verified path exists, state the limitation explicitly rather than claiming support. Preserve the user's settings, bindings, mouse and keyboard interactions.
4. Implement owner activation, focus restoration, input-mode changes, binding/glyph refresh, and dynamic-row cleanup using the [interaction guide](references/INTERACTION-GUIDE.md). Add navigation through narrow target adapters; never copy or replace Blizzard's secure managers or treat a callable function as permission.
5. Validate the guide's per-client cases using the user's selected workflow. Separate source inspection, simulated behavior, and in-game controller results. Without a controller, compatible client, simulator, or automation access, mark the affected checks **not run**; static inspection cannot establish runtime compatibility.

For source lookup, use [the API index](../wow-api-index/SKILL.md), [settings/input](../wow-api-settings-system/SKILL.md), [widget contracts](../wow-api-widget/SKILL.md), [FrameXML lifecycle](../wow-api-framexml/SKILL.md), and [secure execution](../wow-api-lua-environment/SKILL.md). Combine this workflow with [native UI construction](../wow-native-ui/SKILL.md) or [UI skinning](../wow-ui-skinning/SKILL.md), as appropriate.
