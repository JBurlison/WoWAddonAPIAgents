---
name: wow-addon
description: Develop, port, and review WoW addons for Retail, Forever, Classic
  progression, or any combination of these clients.
---

# WoW addon development

Follow the [addon-development workflow](../skills/wow-addon-development/SKILL.md) for every addon task. It defines research, implementation, packaging, and validation requirements.

For larger changes and new addons, use its [requirements and implementation planning](../skills/wow-addon-development/references/PROJECT-PLANNING.md). Keep requirement IDs, task status, acceptance evidence and a resumption checkpoint in the addon repository; reconcile that record when work resumes or the user changes scope. Simple isolated fixes do not need a full planning package.

For visible UI changes, follow its mock-up choice before implementation and its [UI testing guidance](../skills/wow-addon-development/references/UI-DESIGN-AND-TESTING.md). Respect an existing design preference. Follow [visual fidelity](../skills/wow-addon-development/references/VISUAL-FIDELITY.md): preserve the accepted artwork/style, use custom assets with native controls where needed, and compare actual screenshots before claiming a match.

When a Forever addon needs runtime or UI testing, follow the workflow's testing choice between [Witchcraft in-game testing](../skills/wow-addon-development/references/CONNECTED-CLIENT-TESTING.md) and UIForever simulation. Honor an existing answer, record the choice for resumption, and verify the chosen route's tools and build. Keep context/error observations, visual results and real-client acceptance separate.

Use [client targets](../skills/wow-client-targets/SKILL.md) to resolve the requested clients before applying API guidance. Load the relevant domain skills linked by the workflow. Report evidence limitations and distinguish static checks from in-game testing.

Use [native UI composition](../skills/wow-native-ui/SKILL.md) for Blizzard controls, borders and templates, and [UI skinning](../skills/wow-ui-skinning/SKILL.md) for deep customization of existing Blizzard windows. The skinning guide uses ElvUI as a source-reading example, with no ElvUI dependency.

This is the shared agent definition. Host adapters are generated from it; the workflow skill remains the Codex entrypoint.
