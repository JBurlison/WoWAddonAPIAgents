---
name: wow-addon-development
description: End-to-end WoW addon workflow for Retail, Forever, and Classic progression. Use for scoping, client targeting, options, localization, UI mock-ups, controller support, testing, compatibility, and CurseForge packaging.
---

# WoW addon development

## 1. Choose proportional workflow ceremony

| Scope tier | When it applies | Planning docs | UI mock-up gate | Options & localization |
|---|---|---|---|---|
| **Tier 1: Small fix** | Isolated bug fix, 1-line/few-line tweak, minor anchor/color tweak with clear intent | Concise task notes; skip planning templates | Skip unless intent/layout is unclear | Preserve existing config/catalog; avoid unrelated rewrites |
| **Tier 2: Single-session feature** | Small single-file addon or bounded feature within one system | Short inline checklist in task notes | Ask only for new or redesigned UI layouts | Baseline requirement (unless no configurable behavior) |
| **Tier 3: Multi-system / multi-target** | New multi-file addon, port, or multi-session project | Maintain `REQUIREMENTS.md` & `IMPLEMENTATION-MATRIX.md` per [project planning](references/PROJECT-PLANNING.md) | Ask once before implementing visible UI | Baseline requirement; verify per-client menu, persistence & locales |

## 2. Establish the target contract

1. Read [wow-client-targets](../wow-client-targets/SKILL.md) before selecting APIs. Explicit user targets override existing TOCs or configs; otherwise inspect TOCs, packaging, and compat layers, and ask if ambiguous. Never silently default to Retail.
2. Support `retail`, `forever`, `classic`, and `all` (strictly these three). Classic means Classic progression, not Era. Era, Anniversary, PTR, beta, or private servers require an explicit scope decision rather than silent substitution.
3. Record selected targets, source commits, interface versions, and unresolved availability in the addon project's docs. Keep installed plugin files read-only.

## 3. Anchor larger projects (Tier 3)

For Tier 3 work, follow [project planning and resumption](references/PROJECT-PLANNING.md): copy the packaged templates if no tracker exists, assign stable `REQ-` IDs, work through dependency-ordered vertical slices, and update the matrix and resume checkpoint after each slice or before handoff. Planning files organize work and do not create extra approval gates.

## 4. Baseline requirements: options and localization

For new addons and relevant changes, follow [addon options](../wow-api-settings-system/references/ADDON-OPTIONS.md) and [localization](references/LOCALIZATION.md):
- **Options:** Expose user-configurable behavior via [settings](../wow-api-settings-system/SKILL.md) in the client's built-in addon settings menu, with stable internal IDs, `ADDON_LOADED` defaults/migrations, and verified registration. (Record a note if the addon has no configurable behavior.)
- **Localization:** Route addon-owned UI, options, tooltips, help, errors, and controller hints through a localization catalog with a complete English fallback. Translate intended meaning into natural target-language phrasing and record reviewed vs partial/fallback coverage honestly.

## 5. UI design, fidelity & controller gates

- **Mock-up gate (Tier 2–3 new/redesigned visible UI):** Before writing production UI, ask once unless already answered or a design is accepted: *"Would you like a UI mock-up before I start implementation, or should I implement it directly?"* ("Mock-up first" vs "Implement directly"). Continue independent API research while waiting. See [UI design and simulator testing](references/UI-DESIGN-AND-TESTING.md).
- **Visual fidelity:** Follow [visual fidelity](references/VISUAL-FIDELITY.md): preserve accepted layout/artwork, combine custom textures with native hit regions/text/controls where needed, never silently swap stock skins for accepted custom art, and compare rendered screenshots before declaring a match.
- **Controller support:** For every UI change (even mouse-focused requests), apply [controller support](../wow-controller-support/SKILL.md). Classify decorative vs interactive elements; plan focus/reachability, activation, back/close, tabs/scrolling/text entry, and visible hints. Retain mouse/keyboard behavior and user bindings; record target limits, explicit user exclusions, or not-run hardware checks.

## 6. Research APIs & security boundaries

- Query pinned declarations first with [wow-api-index](../wow-api-index/SKILL.md) (`query.mjs`). Historical baseline guides do not override pinned target contracts.
- **Security & Secret Values gate:** Whenever an addon reads combat data, units, auras, damage meters, spells/cooldowns, chat, or manipulates secure frames, consult [taint & restricted-value contracts](../wow-api-lua-environment/references/CURRENT-CONTRACTS.md) and [combat contracts](../wow-api-combat/references/CURRENT-CONTRACTS.md) first. On Retail and Forever, keep secret values opaque (pass directly to permitted widget methods; never compare, format, serialize, or cache them as ordinary Lua values) and respect combat lockdown and `SecretArguments` rules.
- For UI work, pair [native UI composition](../wow-native-ui/SKILL.md) (addon-owned controls/templates) with [UI skinning](../wow-ui-skinning/SKILL.md) (modifying Blizzard windows).
- Resolve target branches to commits once per task, verify loaded Lua/XML/TOC paths and restrictions, and never assume an API exists or was removed across all clients based on Retail. Report offline snapshot dates when live GitHub lookup is skipped or fails.

## 7. Implement for one or several clients

- Prefer event-driven Lua, addon-local namespaces (`local addonName, ns = ...`), safe initialization, and explicit dependency loading.
- For multiple targets, share core Lua modules and isolate differences in thin target adapters; build separate per-target ZIPs with verified `## Interface` numbers per [multi-version layout](references/MULTI-VERSION-ADDONS.md).
- For CurseForge setup, `.pkgmeta`, webhooks, or multi-client publishing, use [CurseForge packaging](../wow-curseforge-packaging/SKILL.md).
- Report unavailable target capabilities explicitly and offer graceful degradation rather than fabricating data. Create project docs in the addon repo, never inside the plugin cache.

## Verify and deliver

- **Forever testing pre-flight & prompt:** Before prompting, check OS and discovered host tools. Note that **Witchcraft requires Windows 10/11 + Node 24+ + PowerShell** ([connected testing](references/CONNECTED-CLIENT-TESTING.md)), while **UIForever** requires browser access ([simulator guide](references/UI-DESIGN-AND-TESTING.md)). When a Forever addon needs runtime/UI testing and no prior choice is recorded, ask once: *"Would you like to test in WoW Forever with Witchcraft, or use UIForever for this round?"* — disclosing any route unavailable in the current environment. Honor existing choices and record the selection for resumption.
- Run static checks and inspect every packaged TOC/file list. Use [client validation](references/CLIENT-VALIDATION.md) (including Lua 5.1 syntax checks, `/console taintLog 1`, `/fstack`, `/etrace`) and [runtime validation](references/RUNTIME-VALIDATION.md) for capability/event probes.
- Keep **design review**, **static checks**, **simulator observations**, **Witchcraft/computer-use observations**, and **in-game acceptance** strictly separate. Clearly list any unperformed checks as not run.
