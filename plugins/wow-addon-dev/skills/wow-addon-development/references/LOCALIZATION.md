# Localize addon-owned text from the start

Localization is a standard requirement for new addons and new or changed user-facing text. Use an addon-local string catalog with a complete English fallback, then add reviewed translations for the declared supported locales. Retain an existing localization framework when appropriate. A localization-ready addon with English fallback is not a fully translated addon: report shipped translations, missing keys and review/testing status honestly. Honor explicit language/scope decisions and avoid rewriting unrelated legacy text during an isolated fix.

## Catalog and loading contract

- Inventory options/category names, labels, tooltips, buttons, dialogs, errors, chat/help/status text, keybinding descriptions and controller action hints. Localize addon-owned wording; use verified native localized labels where their meaning matches. Do not translate player input, proper names or game-supplied localized values through an English lookup table.
- Use stable semantic keys (`OPTIONS_ENABLED`) and stable internal IDs. Never use translated text as SavedVariables keys, profile identifiers, enum values, protocol fields, event names, slash-command dispatch tokens or asset paths. Localize help/aliases separately if deliberately supported; language changes must not reset preferences.
- Load the base catalog, then applicable locale overrides, then all consumers in every target's TOC/XML order. Set strings before constructing settings or XML labels. Keep the catalog addon-local; do not overwrite Blizzard globals. Do not persist derived display strings as configuration.
- Select the client text locale with verified `GetLocale()` semantics; realm region and OS locale do not establish the UI language. Do not assume `enGB` or other locales should alias another locale without a documented policy. Unknown or incomplete locales fall back to English. A runtime language selector is optional and requires explicit refresh/reload behavior if implemented.

This original minimal pattern requires no localization library. It illustrates fallback and loading; it is not a complete translation pack or a client-tested addon.

```lua
-- Locales/Base.lua (first in each target's file list)
local _, ns = ...
ns.L = {
    OPTIONS_UNAVAILABLE = "Addon options are unavailable in this client state.",
    OPTIONS_ENABLED = "Enable display",
    OPTIONS_ENABLED_TOOLTIP = "Show the addon window.",
    STATUS_PROFILE = "Profile: %s",
}
```

```lua
-- Locales/esES.lua (after Base.lua, before consumers)
local _, ns = ...
if GetLocale() ~= "esES" then return end
-- Context: "display" means the addon window, not the screen/monitor.
ns.L.OPTIONS_ENABLED = "Mostrar la ventana"
-- Other entries retain the English fallback until translated and reviewed.
```

Consumers use `local L = ns.L`, then `L.OPTIONS_ENABLED` or `string.format(L.STATUS_PROFILE, profileName)`. The addon namespace is supplied by its file-loading convention, not a new global. Include the same catalog files in each selected client's distributable. An existing framework can provide equivalent fallback; do not add a library solely for this pattern. Treat the sample translation as illustrative rather than evidence of complete Spanish support.

## Formatting and layout

- Translate the intended action/message for the target audience, not English words one by one. Use natural idioms, sentence structure, register and established WoW terminology for that locale; account for gender, agreement, plural rules, politeness and cultural context where relevant. Preserve the action's meaning, safety implications and distinctions such as enable/disable, save/apply and reset/delete. Supply translators with the control's purpose, surrounding UI, variables and screenshots; an ambiguous short label may need contextual keys or explanatory text.
- Give each locale freedom to rephrase, reorder or expand the message rather than forcing English grammar or length. Have a fluent speaker review wording in context when available; label unreviewed/generated translations accordingly. A back-translation or automated syntax check can flag issues but cannot establish naturalness or linguistic acceptance. Fix the meaning or layout instead of truncating away essential instructions.
- Translate complete phrases rather than concatenated English fragments. Preserve placeholder counts/types, escape sequences and markup; use `%%` for a literal percent in a format string. Support translator-controlled reordering through a verified formatter or named-token helper when needed; do not assume Lua 5.1 supports positional printf specifiers. Use deliberate plural/count variants appropriate to each translated language.
- Keep number/date formatting and game grammar separate from literal UI text. Verify each client's localized formatting helper and its restrictions; do not strip or format secret values to make them printable. Never translate machine-readable addon messages or parse game data by localized display names when stable IDs are available.
- Package UTF-8 text, preserve accents and non-Latin characters, and use fonts with verified glyph coverage in the selected client. Lua byte length/substrings do not measure glyphs or display width. Verify fonts, wrapping, truncation and control dimensions in the renderer, including CJK/Cyrillic where supported, long translations and the chosen UI scale.
- Size controls for actual translated content. Keep hit regions, controller focus and action hints aligned; avoid baking translatable labels into textures. Properly handle localized TOC metadata and XML strings only through directives/paths verified for that target. Translations must not break file loading or stable addon identity.

## Acceptance and coverage

1. Scan new/changed display sites for hardcoded text and missing base keys. Compare locale overrides with the base catalog for unknown keys and mismatched format placeholders; include tooltips, chat/help, XML and binding labels in the review. Keep developer diagnostics distinguished from user-facing errors.
2. Exercise the base locale, at least one shipped non-English locale, an incomplete/unknown locale fallback and an expanded-text fixture. Fixtures establish layout behavior only; do not claim actual language/client acceptance from pseudo-localization.
3. Verify that settings can still be found and changed, controller hints are readable, saved preferences/profile IDs survive a locale change, and missing translations never produce nil text or format errors. Preserve native bindings and existing design/testing choices.
4. Review target-language meaning, naturalness, consistent game terminology and contextual clarity separately from placeholder/layout checks. Record locale, client/build, catalog revision, linguistic reviewer/status and result. Maintain a coverage list of reviewed/partial translations and not-run cases. Do not claim all WoW languages are translated or tested merely because the English fallback works.

## Focused source evidence

Reviewed **2026-11-09** at the same three pins as [addon options](../../wow-api-settings-system/references/ADDON-OPTIONS.md#focused-source-evidence). [Retail Locale declarations](https://github.com/Gethe/wow-ui-source/blob/297d7aaaa736f346b3e036f38ee088eaf7f8c07f/Interface/AddOns/Blizzard_APIDocumentationGenerated/LocaleDocumentation.lua), [Forever Locale declarations](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_APIDocumentationGenerated/LocaleDocumentation.lua) and [Classic Locale declarations](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/LocaleDocumentation.lua) declare `GetLocale() -> localeName: cstring`, separately from OS locale, region and available-locale queries. These are source contracts, not runtime certification or a promise that every locale is available on every client/account.

Use [miscellaneous systems](../../wow-api-misc-systems/SKILL.md) and the [API index](../../wow-api-index/SKILL.md) to verify actual locale, localization and font helpers. The catalog/fallback pattern above is addon-owned architecture; native localization APIs do not translate arbitrary addon text automatically. This focused study leaves the broader snapshot registry unchanged; disclose dated/offline evidence and re-resolve targets for fresh tasks.
