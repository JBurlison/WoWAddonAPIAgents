---
name: wow-addon-development
description: Design, build, debug, port, and package World of Warcraft addons for Retail, Forever, Classic progression, or any combination of these clients. Use for requirements tracking, options-menu integration, localization, architecture, UI mock-ups, visual fidelity and controller consideration, user-selected Witchcraft or UIForever testing, Lua/XML/TOC implementation, compatibility, and release validation.
---

# WoW addon development

## Establish the target contract

1. Read [wow-client-targets](../wow-client-targets/SKILL.md) before selecting APIs. Explicit user targets take precedence over existing configuration. Inspect TOCs, packaging configuration, and existing compatibility modules; ask if the target remains ambiguous. Do not silently default to Retail.
2. Support `retail`, `forever`, `classic`, and `all` (exactly these three). Classic means the progression branch, not Classic Era. Requests for Era, Anniversary, PTR, beta, or private servers require a scope change, not silent substitution.
3. Record selected targets, upstream commits, client/interface versions, feature requirements, and unresolved availability in the addon project's documentation. Keep installed plugin files read-only during ordinary addon work.

## Keep larger projects anchored to written requirements

For a new addon, a substantial feature, or a long request spanning multiple systems, follow [project planning and resumption](references/PROJECT-PLANNING.md). Create or update the requirements document and implementation matrix in the user's addon repository, using the packaged templates when no equivalent documents exist. Give requirements stable IDs and connect every requested behavior to implementation work and observable acceptance evidence, including target-specific and visual checks. A small isolated fix can use concise task notes instead.

Work through bounded, dependency-ordered slices. Update the matrix and its checkpoint after each slice and before a handoff or context reset. On resumption, read those files and inspect the recorded revision before continuing; reconcile new user instructions without silently losing earlier requirements. Existing authorization remains valid: the documents organize work and do not create an extra approval gate. Keep unresolved required behavior visible instead of marking the whole project complete because the current slice passes.

## Treat options and localization as baseline requirements

For new addons and relevant changes, follow [addon options](../wow-api-settings-system/references/ADDON-OPTIONS.md) and [localization](references/LOCALIZATION.md). Expose user-configurable behavior through the selected client's built-in addon settings menu, with stable setting identities, saved defaults/migrations and verified registration/loading. Route options work through [settings](../wow-api-settings-system/SKILL.md). A slash command can supplement discovery. An addon with no configurable behavior can record that reason; preserve explicit user exclusions and avoid expanding an isolated unrelated fix.

Route addon-owned visible text through a localization catalog with a complete English fallback, including options, tooltips, help, errors and controller hints. Translate intent into natural target-language phrasing, grammar and terminology rather than matching English words or sentence structure. Record supported locales, translation/review coverage and per-client menu, persistence and localized-layout acceptance in requirements or task notes. Fallback readiness is not evidence that every language is translated or tested. Carry both requirements through implementation and delivery without adding approval gates.

## Ask about a UI mock-up before implementation

When the task creates or changes a visible addon UI, ask once before implementing it: **"Would you like a UI mock-up before I start implementation, or should I implement it directly?"** Offer "Mock-up first" and "Implement directly". Honor an existing answer, an explicit mock-up request, or an already accepted design without asking again. This question is not needed for work with no UI change.

Wait for the choice before writing the production UI; continue independent API research and project inspection while waiting. If a mock-up is requested, show a concrete layout with representative states and collect feedback before implementing that design. If declined, proceed directly. Use [UI design and simulator testing](references/UI-DESIGN-AND-TESTING.md) for the mock-up handoff and UIForever workflow. A simulator prototype is optional; a static mock-up is valid when interactive tools or the target flavor are unavailable.

## Preserve the accepted appearance

Visually inspect the accepted mock-up and follow [visual fidelity](references/VISUAL-FIDELITY.md): record its layout and asset plan, choose rendering techniques that reproduce it, and compare actual implementation screenshots against it. Use custom artwork with native text/input/hit regions when the design requires it; do not silently replace the artwork or styling with stock controls and built-in textures. Native controls must remain functional and respect target-specific security rules.

Compare a representative panel early, fix material differences, and repeat before claiming visual completion. Working controls and no Lua errors are not a visual pass. If capture or rendering is unavailable, report the visual comparison as not run; if the design cannot be reproduced, surface the concrete limitation and proposed alternative instead of redefining the accepted mock-up.

## Consider controller support for every UI element

For every task that creates or changes UI, use [controller support](../wow-controller-support/SKILL.md) during design, implementation and acceptance. This is required even when the request mentions only mouse interaction. Classify decorative elements separately; for each interactive element, account for focus/reachability, activation, back/close, tabs, scrolling or text entry as applicable, and visible focus/action hints. Preserve native controller behavior when restyling controls. Honor an explicit user decision to exclude controller operation and record its scope instead of silently forgetting the assessment.

Record the controller interaction plan and per-client capability gaps in the project's requirements or concise task notes. Use verified native navigation/input paths; a mouse-click handler or emulated cursor alone does not prove directional navigation. Keep existing mouse/keyboard behavior and user bindings/settings intact. If controller testing is unavailable, carry the outstanding checks forward and report them as not run rather than claiming support. A passive display can be not applicable with a reason; decorative regions need not become focus stops.

## Research only the needed systems

For Blizzard-style panels, borders, buttons, fonts, textures and other native controls, use [native UI composition](../wow-native-ui/SKILL.md). For reskinning existing Blizzard windows, including the character screen and spellbook, use [UI skinning](../wow-ui-skinning/SKILL.md). Use both when a custom theme combines new addon-owned widgets with existing game frames. Native composition does not imply stock artwork when the accepted design calls for custom art.

Use [wow-api-index](../wow-api-index/SKILL.md) to select domain skills. Each old domain reference is a historical Retail baseline unless a section supplies newer, target-specific evidence. Use [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md) for differences.

Resolve the selected source branches to commits once per task, and use those commit-pinned sources throughout the task. Check generated API definitions, client-specific Lua/XML loading paths, events and payloads, argument/return types, and addon access restrictions. A name in a shared generated file is not proof that the feature loads for the selected client. Version-specific wiki pages supplement source evidence; they do not override the selected client.

Never fabricate a signature, silently substitute a Retail API into Forever/Classic, or declare an API removed on every client because Retail removed it. Function existence is only one compatibility check. If offline, disclose the bundled snapshot date/version and limit claims to verified evidence.

## Implement for one or several clients

- Preserve the addon's established architecture and requested features. Prefer event-driven Lua, addon-local namespaces, intentional globals, safe initialization, and explicit dependency loading.
- For multiple targets, share core modules and isolate differing signatures and behavior in a small compatibility layer. Follow [addon layout](references/MULTI-VERSION-ADDONS.md).
- Produce a separate distributable for each selected target with the correct interface number and file load order. Do not require users to install multiple copies of the addon in one client's AddOns folder.
- Determine security rules per target and context. Respect protected operations, combat lockdown, taint, and secret values where applicable. Do not attempt to reveal restricted data.
- If a required capability is unavailable, report the affected target and propose a reduced feature or an explicit unsupported result. Do not silently return fabricated data or remove the target.
- Reuse verified library APIs when appropriate. Create project-specific knowledge in the user's addon repository when it serves the requested work; never edit a cached marketplace installation to remember it.

## Verify and deliver

When a Forever addon is ready for runtime or UI testing, ask once: **"Would you like to test in WoW Forever with Witchcraft, or use UIForever for this round?"** Offer "Witchcraft in-game" and "UIForever simulator". Honor an existing testing preference or explicit testing request without asking again. This choice is separate from the earlier mock-up choice. Record it in the addon task notes or requirements and resume checkpoint so it survives handoffs.

Explain the options briefly: Witchcraft supplies actual-client context and Lua errors, with computer use or the user's reproduction for interactions/screenshots; UIForever provides supported browser simulation. Follow the selected route using [connected client testing](references/CONNECTED-CLIENT-TESTING.md) or [UIForever simulator testing](references/UI-DESIGN-AND-TESTING.md). Check available tools and the actual build. If the selected route needs setup or is unavailable, explain the concrete prerequisite and let the user choose setup, an alternative, or deferral; reuse prior setup authorization. While awaiting the choice, continue static checks and packaging. Leave unperformed checks not run. For other selected clients, choose matching validation tools and retain their separate acceptance results.

Run relevant static checks and inspect each target's packaged TOC/file list. Use [client validation](references/CLIENT-VALIDATION.md) for in-game acceptance. For fresh API captures, disputed availability or event probes, use [runtime validation](references/RUNTIME-VALIDATION.md) and keep source, presence, registration and operation results separate. Report selected targets, source commits, compatibility choices, mock-up and testing choices, checks performed, unsupported features, and checks requiring a game client. Static checks and simulator passes do not prove in-game compatibility.

For the selected in-game route, discover the host's Witchcraft MCP and computer-use capabilities and honor existing setup authorization. Keep context freshness, screenshots, interaction results and per-client acceptance separate. Provide reproducible user steps for capabilities the host lacks and record which actions the user performs.
