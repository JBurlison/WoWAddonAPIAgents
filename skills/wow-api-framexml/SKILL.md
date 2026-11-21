---
name: wow-api-framexml
description: Look up WoW FrameXML Lua helpers, mixins, object pools, SharedXML utilities, callbacks, and secure templates (`StaticPopup_Show`, `Mixin`, `EventRegistry`).
---

# WoW FrameXML API

Resolve targets with [wow-client-targets](../wow-client-targets/SKILL.md) and follow [wow-addon-development](../wow-addon-development/SKILL.md) for UI design, visual fidelity, and testing baselines.

## Target-specific decisions

Use [native UI composition](../wow-native-ui/SKILL.md) for template/artwork selection or [UI skinning](../wow-ui-skinning/SKILL.md) for Blizzard window hooks. Trace the owning Blizzard addon and its TOC/XML includes to the selected game type before using a mixin, pool, helper, or global; verify load-on-demand dependencies and signatures. Read [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md) and report offline snapshot limits.

## Detailed lookup material

Start with [current loaded UI sources](references/CURRENT-UI-SOURCES.md) for pinned TOCs, mixins/pools, callback ownership, secure templates, and the boundary between Lua helpers and native methods. The [historical Retail baseline](references/RETAIL-BASELINE.md) retains older listings as a research aid only:

- [ChatFrame containers](references/CHATFRAME-CONTAINERS.md)
- [FrameXML game utils](references/FRAMEXML-GAME-UTILS.md)
- [Mixins and pools](references/MIXINS-AND-POOLS.md)
- [SharedXML data utils](references/SHAREDXML-DATA-UTILS.md)
- [SharedXML UI utils](references/SHAREDXML-UI-UTILS.md)
- [UIParent](references/UIPARENT.md)
