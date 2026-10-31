---
name: wow-addon-development
description: Design, build, debug, port, and package World of Warcraft addons for Retail, Forever, Classic progression, or any combination of these clients. Use for addon architecture, Lua/XML/TOC implementation, compatibility, API selection, and release validation.
---

# WoW addon development

## Establish the target contract

1. Read [wow-client-targets](../wow-client-targets/SKILL.md) before selecting APIs. Explicit user targets take precedence over existing configuration. Inspect TOCs, packaging configuration, and existing compatibility modules; ask if the target remains ambiguous. Do not silently default to Retail.
2. Support `retail`, `forever`, `classic`, and `all` (exactly these three). Classic means the progression branch, not Classic Era. Requests for Era, Anniversary, PTR, beta, or private servers require a scope change, not silent substitution.
3. Record selected targets, upstream commits, client/interface versions, feature requirements, and unresolved availability in the addon project's documentation. Keep installed plugin files read-only during ordinary addon work.

## Research only the needed systems

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

Run relevant static checks and inspect each target's packaged TOC/file list. Use [client validation](references/CLIENT-VALIDATION.md) for in-game acceptance. Report selected targets, source commits, compatibility choices, checks performed, unsupported features, and checks requiring a game client. Static checks do not prove in-game compatibility.
