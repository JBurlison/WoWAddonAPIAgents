---
name: wow-client-targets
description: Resolve Retail, Forever, and Classic progression client targets, source pins, and compatibility rules. Use before API lookup, client detection, TOC versioning, or porting between WoW versions.
---

# Client targets and source evidence

| Target | Branch in Gethe/wow-ui-source | Meaning |
|---|---|---|
| retail | live | Current Retail |
| forever | forever | Forever; not Classic Era |
| classic | classic | Current Classic progression |

`all` expands to these three only. Explicit targets override inferred configuration. Use the existing addon's documented targets, TOCs, and release configuration when the request omits targets; ask if these conflict or are inconclusive. Do not identify a client solely from a namespace name, a shared project constant, or one TOC interface value.

## Snapshot and current sources

[targets.json](references/targets.json) records bundled source-inventory snapshots (not certification of every API). Interface numbers are derived from `version.txt` and must be confirmed against `select(4, GetBuildInfo())` in the target client. Optionally run `node` on [scripts/targets.mjs](scripts/targets.mjs) (`retail forever` or `all`) to print bundled metadata; no Node dependency is required to read the files.

For API and source lookup, follow this order:

1. **Query the bundled pinned ledger first:** Use [wow-api-index](../wow-api-index/SKILL.md) (`query.mjs`) or domain `catalog.json` files for exact signatures, event payloads, structures, enums, and security annotations at the bundled pins. This avoids unnecessary web calls and GitHub rate limits.
2. **Check live GitHub only when newer builds or handwritten UI files are needed:** Resolve `https://api.github.com/repos/Gethe/wow-ui-source/commits/<branch>` to capture the full SHA (never mix moving branch content with pinned evidence), then inspect `version.txt`, `Blizzard_APIDocumentationGenerated`, and owning UI addon TOC/XML/Lua files (`[Family]`/`[Game]`/`AllowLoad*`).
3. **Record evidence separately:** Track target, commit, source path, contract, loading, and restrictions using the [evidence record](references/EVIDENCE-RECORDS.md), keeping declaration, runtime presence, and tested operation distinct. Missing generated docs means unknown, not removed.
4. **Trace loaded client constants:** Check `WOW_PROJECT_ID` constants for the selected commit rather than guessing a Forever project ID. When runtime detection is inconclusive, rely on per-target packaged configuration plus `GetBuildInfo()` checks.
5. **Apply per-target compatibility:** Consult [COMPATIBILITY.md](references/COMPATIBILITY.md), then the specific domain skill. Scope deprecations and restrictions strictly to verified builds.

If online checks fail, state that the latest branch commit could not be checked, use dated bundled evidence where sufficient, flag unresolved features, and never alter snapshot metadata.

For Forever identity, defect history, and recent updates, read [Forever build evidence](references/FOREVER.md) and [source evidence](references/SOURCE-EVIDENCE.md). For runtime probes, follow [runtime validation](../wow-addon-development/references/RUNTIME-VALIDATION.md).
