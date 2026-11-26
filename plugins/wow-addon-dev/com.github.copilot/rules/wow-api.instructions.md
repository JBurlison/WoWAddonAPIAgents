---
name: WoW client-aware API guidance
description: Select the target client before applying WoW API signatures, security rules, and TOC metadata.
applyTo: "**/*.lua,**/*.xml,**/*.toc"
---

# WoW target selection

Use [`wow-addon-development`](../../skills/wow-addon-development/SKILL.md) and [`wow-client-targets`](../../skills/wow-client-targets/SKILL.md). Resolve explicit targets or inspect the addon's existing configuration; ask when ambiguous. Supported targets are Retail (`live`), Forever (`forever`), and Classic progression (`classic`). `All` means those three only.

Pin source evidence per target. Verify signatures, event payloads, loaded templates, and addon restrictions before use via [`wow-api-index`](../../skills/wow-api-index/SKILL.md). Apply Secret Values, combat restrictions, and deprecations only where verified for that client/build. Historical Retail 12.0.0 notes are not universal rules. Use separate target artifacts with shared core code and verified adapters. Report offline/stale evidence and distinguish static checks from in-game validation.

For new addons and relevant changes, require discoverable addon options ([`wow-api-settings-system`](../../skills/wow-api-settings-system/references/ADDON-OPTIONS.md)) and localization ([`LOCALIZATION.md`](../../skills/wow-addon-development/references/LOCALIZATION.md)). Verify per-client menu registration and `SavedVariables` lifecycle ([`wow-addon-structure`](../../skills/wow-addon-structure/SKILL.md)); keep internal IDs stable. Catalog user-facing text with an English fallback, translate meaning into natural target-language phrasing and record reviewed/partial coverage. Honor explicit scope decisions; static checks do not establish linguistic or client acceptance.

For visible UI changes, follow the workflow's mock-up choice before implementation, honoring an existing answer or accepted design. Route addon-owned controls to [`wow-native-ui`](../../skills/wow-native-ui/SKILL.md), Blizzard window restyling to [`wow-ui-skinning`](../../skills/wow-ui-skinning/SKILL.md), and full HUD/total-conversion suites to [`wow-ui-overhaul`](../../skills/wow-ui-overhaul/SKILL.md). Use UIForever testing ([`UI-DESIGN-AND-TESTING.md`](../../skills/wow-addon-development/references/UI-DESIGN-AND-TESTING.md)) for available matching flavors; simulator checks do not replace real-client tests.

Every UI change must consider [`wow-controller-support`](../../skills/wow-controller-support/SKILL.md): reachability/focus, activation, back/close and relevant tabs, scrolling or text entry for interactive elements; visible focus/action hints; and preserved mouse/keyboard behavior. Record target-specific limitations or explicit user exclusions and actual test results. Do not silently alter user bindings/settings or claim controller support from mouse-only checks.

Preserve the accepted design using visual-fidelity checks ([`VISUAL-FIDELITY.md`](../../skills/wow-addon-development/references/VISUAL-FIDELITY.md)). Do not silently replace custom artwork with stock skins; combine custom textures and native interaction when appropriate, then compare actual rendered screenshots. Use connected client testing ([`CONNECTED-CLIENT-TESTING.md`](../../skills/wow-addon-development/references/CONNECTED-CLIENT-TESTING.md)) for available Witchcraft context/error tools and native computer use, without assuming either is installed or that no errors proves visual accuracy.

For CurseForge packaging, `.pkgmeta`, library embeds, or upload workflows, follow [`wow-curseforge-packaging`](../../skills/wow-curseforge-packaging/SKILL.md).
