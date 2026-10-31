---
name: wow-client-targets
description: Resolve Retail, Forever, and Classic progression targets and verify version-specific WoW API evidence. Use before addon API lookup, client detection, compatibility decisions, TOC generation, or porting between WoW versions.
---

# Client targets and source evidence

| Target | Branch in Gethe/wow-ui-source | Meaning |
|---|---|---|
| retail | live | Current Retail |
| forever | forever | Forever; not Classic Era |
| classic | classic | Current Classic progression |

`all` expands to these three only. Explicit targets override inferred configuration. Use the existing addon's documented targets, TOCs, and release configuration when the request omits targets; ask if these conflict or are inconclusive. Do not identify a client solely from a namespace name, a shared project constant, or one TOC interface value.

## Snapshot and current sources

[targets.json](references/targets.json) records source-inventory snapshots, not certification of every API. Interface numbers are derived from `version.txt` and must be confirmed against the target client's `select(4, GetBuildInfo())` before release. A source mirror may lead or lag an installed client; honor an explicitly requested build.

With Node.js 22+, optionally run `node <this-skill>/scripts/targets.mjs retail forever` (or `all`) to print bundled metadata. No Node dependency is required to read the skills or perform source lookups using the host's tools.

For current evidence:

1. Resolve `https://api.github.com/repos/Gethe/wow-ui-source/commits/<branch>` and capture the full SHA. Do not mix moving branch content with pinned evidence.
2. Inspect `version.txt` and the tree at that SHA. Start with `Interface/AddOns/Blizzard_APIDocumentationGenerated`, then follow the UI addon's TOC/XML includes and client-specific files. Check shared versus game-specific loading conditions.
3. For each needed capability, record target, commit, source path, signature, event payload, loading conditions, addon restrictions, and status: verified / unavailable / unknown. Missing generated documentation alone means unknown, not removed.
4. Trace the loaded constants before implementing runtime detection. The same tree may contain Mainline, Vanilla, Mists, and other constants with different `WOW_PROJECT_ID` assignments. Do not invent a Forever project ID. When detection cannot uniquely distinguish clients, use per-target packaged configuration plus runtime build validation.
5. Consult [COMPATIBILITY.md](references/COMPATIBILITY.md), then the specific domain skill. Scope every deprecation and restriction to the target/build where it was verified.

If access fails, state that the latest version could not be checked. Use dated bundled evidence only where sufficient; flag unresolved features and do not advance snapshot metadata. A successful function-existence probe does not establish matching semantics or permission to inspect returned values.
