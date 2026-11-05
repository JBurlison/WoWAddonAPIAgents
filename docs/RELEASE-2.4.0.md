# 2.4.0: native UI composition and standalone skinning

Two new portable skills separate building addon-owned controls from modifying Blizzard-owned windows:

- [wow-native-ui](../skills/wow-native-ui/SKILL.md) covers native panels, buttons, NineSlice/backdrop borders, fonts, textures/atlases, layout and scrolling lists. It includes an original panel/button wiring example and a source map.
- [wow-ui-skinning](../skills/wow-ui-skinning/SKILL.md) covers per-window skin modules, client adapters, loading, hooks, repeated state refresh, pooled controls, combat, disable behavior and coexistence. Its character-screen and spellbook recipes trace each supported client's owner and include graph. ElvUI provides linked architectural examples; no ElvUI code, media or dependency is bundled.

The shared addon workflow, host agent adapters, API index, category/domain routing and widget/FrameXML guides now link these skills. Existing mock-up, accepted-design, testing-choice and in-game acceptance guidance remains applicable. Package validation compares the complete maintained skill set with the installed set rather than freezing the count at 35.

## Evidence scope

Source research on **2026-11-05** used Retail `297d7aaaa736f346b3e036f38ee088eaf7f8c07f` (12.1.5.70783), Forever `eac30af597e5aaa43a60f6675ef5fdcea100375f` (1.60.1.70790), and Classic progression `e5d9b3a22c3f0f6f41ebac0e454f4969594261cf` (5.5.4.70631). These already match the packaged registry; this release does not advance the complete API snapshots. The source maps record loading evidence and boundaries rather than claiming runtime compatibility.

ElvUI examples are pinned to `3866b3f0f417c101e809d6fe8e1cb98d27428d63`. The [research guide](../skills/wow-ui-skinning/references/ELVUI-PATTERNS.md) attributes the inspected files and explains their framework and license boundaries. The automatic Gethe updater does not monitor ElvUI; re-resolve its revision when using it for fresh research.

## Validation

- Deterministic reference/package generation and package/link validation passed: **37 skills**, **291 generated outputs**.
- All **68 Node tests** passed, including isolated-package references, generated API consistency and versioning checks.
- Isolated marketplace registration and installation succeeded in Codex, Claude Code and Copilot. Claude and Copilot inventories included both new skills; no normal user profile was changed.
- An independent agent exercised a native Forever panel/list request and an all-client character/spellbook reskin request. The resulting plans preserved control states, resize hooks and current row bindings; selected client-specific owners; avoided ElvUI dependencies; and honored previously supplied design/testing choices. Relevant contracts were checked against pinned source.

These are packaging, source and planning checks. The sample Lua, native panels and reskinned game windows were not executed in a WoW client or simulator. Actual appearance, interactions, combat/taint behavior and restoration still require the addon project's per-client acceptance tests.
