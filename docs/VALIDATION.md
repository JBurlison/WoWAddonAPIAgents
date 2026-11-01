# Validation record

## 2.2.0 visual fidelity and connected-client testing

Validated on Windows, 2026-11-01. Package build/check verified **280 generated outputs** and all **35 skills**, manifests, reference ledgers and links. All **42 Node tests** passed, the five changed skill entry points passed skill-creator validation, and version policy confirmed **2.1.0 → 2.2.0**.

Witchcraft documentation and tool implementation were reviewed at commit `9027fcfedba8b5b9fa60892ca9adbec121628793`. The new guide separates its context/error tools from native computer-use interaction and visual evidence, including freshness and target-build limits. Relevant texture/frame/button operations were checked against the packaged Forever source schemas; this does not verify media conversion or actual rendering.

Independent read-only review exercised the documented decisions for custom artwork versus stock skins, functional controls versus flat images, comparable screenshots, unavailable assets/renderers/tools, and stale MCP observations. It identified ambiguous media-path wording, corrected to an explicit game asset path. This was a document/behavior walkthrough, not a live host/model evaluation. No Witchcraft installation, MCP registration, daemon launch, live game interaction, addon screenshot comparison or new asset-pipeline test was performed. Those results remain not run until an actual addon/client test session is available.

## 2.1.0 UI workflow update

Validated on Windows, 2026-10-31. `npm run build` rebuilt 278 outputs; `npm run check` verified them, all 35 skills, manifests, reference ledgers and local links. All **42 Node tests** passed. The five changed skill entry points passed skill-creator validation, and version policy confirmed **2.0.0 → 2.1.0**.

The live [UIForever](https://uiforever.com/app?flavor=forever) interface was inspected in Codex's desktop in-app browser (browser version not recorded). The default Blizzard UI loaded, the Dungeon scenario was selected and `Errors` showed no Lua errors. `Missing APIs` and `Developer` were inspected; the latter reported **1.60.1.70450 / interface 16001**. No custom addons or personal WTF data were imported. This verifies the documented entry points and baseline flow, not a user's addon or actual WoW client behavior.

Independent document review covered six cases: unspecified mock-up preference, explicit decline, previously accepted design, non-UI fix, Classic-only UI and missing simulator APIs. This was a behavior walkthrough, not an isolated host/model evaluation. Retail simulator testing was not run because the site marked it temporarily disabled; Classic progression was listed as coming soon. Custom-addon simulation and real-client acceptance remain not run for this documentation update.

## Historical installation and release-automation baseline

Validated on Windows, October 31, 2026. These results describe this implementation, not future upstream updates.

After relocating maintained sources to root-level `skills/`, `agents/`, `instructions/`, and `config/`, package/link checks, all 20 tests, workflow compilation/drift checks, and isolated installation in all three hosts passed again. The generator now supplies the Copilot checkout adapters; VS Code skill-location configuration and agent references were checked statically. AI-builder's previously invalid description YAML was repaired during the move.

| Check | Result |
|---|---|
| Deterministic package and manifest/link checks | Passed; 35 packaged skills with all references inside the package. |
| Node tests | 29 tests passed: target selection, per-client evidence decisions, source fingerprints/diffs, errors, isolated package references, generation drift, compiled publication/model guards, version policy, safe PR edits, and release recovery. |
| Live upstream comparison | Resolved live/forever/classic and reported no relevant changes against the initialized snapshots. |
| gh-aw v1.0.1 | Workflow compiled; generated YAML uses Copilot Sonnet for agent and detection with personal Copilot authentication and SHA-pinned actions/container images. |
| Codex CLI 0.166.0-alpha.5.1 | Isolated local marketplace registration, discovery, and plugin installation passed. |
| Claude Code 2.1.316 | Manifest validation and isolated installation passed; component inventory reports 35 skills and one agent. |
| Copilot CLI 1.0.105 | Isolated marketplace registration, browse, install, and enabled-plugin listing passed; 35 skills installed. |
| Existing Copilot checkout | Agent path/frontmatter, shared behavior and relative references validated statically. |
| Release automation | Version 1.0.1 is synchronized across all eight versioned JSON files. PR/release API calls are tested with fixtures, including forks, racing heads, unchanged packages, retries, upload failures, and immutable tags. |
| Workflow syntax | actionlint v1.7.12 passed for validation, PR versioning, and release workflows; the agentic workflow passed its pinned compiler. |

The machine's older Copilot CLI 0.0.362 does not expose plugin commands; a separate temporary 1.0.105 installation was used without upgrading the user's global CLI. Claude was also installed in a temporary tools directory. Host configuration tests used isolated profiles; the user's normal profiles were not changed. Codex reported a harmless refusal to create PATH helper aliases beneath the temporary profile, but plugin operations succeeded.

Claude's optional public-directory listing check warns that no icon is supplied. This repository marketplace does not submit a public-directory listing. Skill/manifest validation succeeds.

The workflow was migrated to personal GitHub Copilot billing. Its inference credential is the repository secret COPILOT_GITHUB_TOKEN; provider API-key requirements have been removed. The configured credential wiring and generated actions were reviewed. No credential value is logged or stored in the repository. Hosted inference still requires the maintainer to configure the secret and run the workflow; local compilation does not verify account entitlements or credit availability.

Not run: hosted GitHub Actions (requires merge and repository setup), Linux CI execution, model-based end-to-end addon generation, interactive VS Code selection, or in-game tests. Install/discovery and static checks do not establish actual game-runtime compatibility. Use [behavior scenarios](BEHAVIOR-SCENARIOS.md) and the [client checklist](../skills/wow-addon-development/references/CLIENT-VALIDATION.md) before addon releases.
