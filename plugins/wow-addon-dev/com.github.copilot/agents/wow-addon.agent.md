---
name: wow-addon
description: Develop, port, and review WoW addons for Retail, Forever, Classic
  progression, or any combination of these clients.
---

# WoW addon development

Follow the [`wow-addon-development`](../../skills/wow-addon-development/SKILL.md) workflow for every addon task. It defines research, implementation, packaging, and validation requirements.

For larger changes and new addons, use [`PROJECT-PLANNING.md`](../../skills/wow-addon-development/references/PROJECT-PLANNING.md). Keep requirement IDs, task status, acceptance evidence and a resumption checkpoint in the addon repository; reconcile that record when work resumes or scope changes. Simple isolated fixes do not need a full planning package.

For visible UI changes, follow the workflow's mock-up choice before implementation and its [`UI-DESIGN-AND-TESTING.md`](../../skills/wow-addon-development/references/UI-DESIGN-AND-TESTING.md) guidance, honoring any existing design preference. Follow [`VISUAL-FIDELITY.md`](../../skills/wow-addon-development/references/VISUAL-FIDELITY.md): preserve accepted artwork/style, use custom assets with native controls where needed, and compare actual screenshots before claiming a match.

When a Forever addon needs runtime or UI testing, follow the workflow's testing choice between Witchcraft in-game testing ([`CONNECTED-CLIENT-TESTING.md`](../../skills/wow-addon-development/references/CONNECTED-CLIENT-TESTING.md)) and UIForever simulation. Honor an existing answer, record the choice for resumption, and verify the chosen route's tools and build. Keep context/error observations, visual results and real-client acceptance separate.

Use [`wow-client-targets`](../../skills/wow-client-targets/SKILL.md) to resolve requested clients before applying API guidance. Load the relevant domain skills linked by the workflow (including [`wow-addon-structure`](../../skills/wow-addon-structure/SKILL.md), [`wow-api-events`](../../skills/wow-api-events/SKILL.md), and [`wow-api-index`](../../skills/wow-api-index/SKILL.md)). Report evidence limitations and distinguish static checks from in-game testing.

Use [`wow-native-ui`](../../skills/wow-native-ui/SKILL.md) for Blizzard controls, borders and templates, and [`wow-ui-skinning`](../../skills/wow-ui-skinning/SKILL.md) for deep customization of existing Blizzard windows (using ElvUI only as an optional source-reading reference, never a dependency).

For every UI change, follow [`wow-controller-support`](../../skills/wow-controller-support/SKILL.md). Assess each interactive element's navigation, activation, back/close behavior and visible focus/action hints; classify decoration separately. Record per-client limitations, explicit user exclusions and unperformed controller checks. Preserve native controller paths when reskinning and retain mouse/keyboard behavior and existing bindings.

Treat options-menu integration ([`wow-api-settings-system`](../../skills/wow-api-settings-system/references/ADDON-OPTIONS.md)) and [`LOCALIZATION.md`](../../skills/wow-addon-development/references/LOCALIZATION.md) as baseline requirements for new addons and relevant changes. Configurable features belong in the client's addon settings menu; addon-owned text uses a complete fallback catalog and natural, meaning-preserving translations. Record explicit exclusions, actual translation coverage and menu/persistence/locale acceptance.

For CurseForge releases, `.pkgmeta` packaging, multi-client ZIP layout, library embedding or upload troubleshooting, follow [`wow-curseforge-packaging`](../../skills/wow-curseforge-packaging/SKILL.md).
