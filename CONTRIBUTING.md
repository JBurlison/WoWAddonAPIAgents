# Contributing

Use Node.js 22+. Maintained sources are curated `skills/` content, `agents/`, `instructions/wow-api.instructions.md`, `config/plugin.json`, and the explicit declaration ownership map `config/api-owners.json`. The shared WoW agent delegates to the `wow-addon-development` workflow skill. Do not hand-edit generated `.github/agents/`, `.github/instructions/`, reference JSON/catalogs/event tables, or `plugins/wow-addon-dev`.

```sh
npm ci --ignore-scripts
npm run build
npm run check
npm test
```

Build synchronizes the package and host adapters. Check rejects drift, malformed skill frontmatter, invalid target metadata/catalog identities, broken case-sensitive links, and references escaping the installed package. Tests cover target resolution, capability evidence, upstream comparison/failures, and isolated package loading. CI runs on Windows and Linux.

New claims need target, commit, source, signature/payload, load conditions, and restrictions. Preserve historical provenance for unverified claims. Missing generated documentation does not prove removal. Never vendor a complete upstream source tree.

To refresh declaration references after reviewing target changes:

```sh
node scripts/prepare-api-sources.mjs
node scripts/generate-api-references.mjs
node scripts/generate-api-references.mjs --check
node scripts/generate-api-references.mjs --verify-source
npm run build
npm run check
npm test
```

The preparer fetches exact registry SHAs into ignored `.cache/api-audit/{retail,forever,classic}` and rejects dirty/unexpected repositories. It does not execute upstream code or change target metadata. With a fresh `.cache/upstream-report.json`, `--candidates` prepares candidate pins for review before advancing the registry. After advancing reviewed metadata, rerun without `--candidates`, deliberately assign any new file/group in `config/api-owners.json`, and regenerate references. Commit the registry, ownership changes, regenerated references and rebuilt package together. Never advance a pin while leaving old reference schemas behind. Preserve local source changes yourself when a cache is rejected; do not force-clean a working checkout.

The generator's `--check` is offline and suitable for consumers of committed artifacts; `--verify-source` requires the clean pinned caches and compares extraction results. Selected semantic anchors intentionally fail on contract drift, even if hashes were regenerated. Review such changes explicitly before updating validator code. The daily agent cannot edit scripts/tests to bypass a failed contract. See [source roles and cadence](docs/AUTOMATION.md#source-roles-and-review-cadence) for the separate treatment of primary declarations and build-scoped community observations.

`npm run check:upstream` writes candidate evidence to ignored `.cache/upstream-report.json` without changing committed snapshots. Review every changed target before advancing metadata. Rebuild and validate after edits. Use `npm run version:bump -- patch` (or `minor`/`major`) to synchronize release versions; preserve marketplace/plugin names. Same-repository plugin-changing PRs receive a patch bump automatically. See [versions and releases](docs/RELEASING.md).

AI-builder and its four helper skills remain maintainer-only. Provider-specific folders and agent metadata are not interchangeable; use the actual host specifications.

Install the pinned compiler: `gh extension install github/gh-aw --pin v1.0.1`. Run `npm run compile:workflow` after workflow changes and commit the Markdown, lock YAML, and compiler pin files together. `npm run check:workflow` rejects drift. A standalone compiler may be supplied with `GH_AW_BIN`; GitHub CLI must also be available for compiler lookups. See [automation](docs/AUTOMATION.md).

Before release, smoke-test installation in clean Codex, Claude Code, and Copilot profiles, then record host versions and results. See [behavior scenarios](docs/BEHAVIOR-SCENARIOS.md). Link/schema checks are not interactive or in-game tests.
