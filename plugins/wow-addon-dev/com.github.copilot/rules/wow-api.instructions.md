---
name: WoW client-aware API guidance
description: Select the target client before applying WoW API signatures, security rules, and TOC metadata.
applyTo: "**/*.lua,**/*.xml,**/*.toc"
---

# WoW target selection

Use [wow-addon-development](../../skills/wow-addon-development/SKILL.md) and [wow-client-targets](../../skills/wow-client-targets/SKILL.md). Resolve explicit targets or inspect the addon's existing configuration; ask when ambiguous. Supported targets are Retail (live), Forever (forever), and Classic progression (classic). All means those three only.

Pin source evidence per target. Verify signatures, event payloads, loaded templates, and addon restrictions before use. Apply Secret Values, combat restrictions, and deprecations only where verified for that client/build. Historical Retail 12.0.0 notes are not universal rules. Use separate target artifacts with shared core code and verified adapters. Report offline/stale evidence and distinguish static checks from in-game validation.
