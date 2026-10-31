# Validation record

Validated on Windows, October 31, 2026. These results describe this implementation, not future upstream updates.

After relocating maintained sources to root-level `skills/`, `agents/`, `instructions/`, and `config/`, package/link checks, all 20 tests, workflow compilation/drift checks, and isolated installation in all three hosts passed again. The generator now supplies the Copilot checkout adapters; VS Code skill-location configuration and agent references were checked statically. AI-builder's previously invalid description YAML was repaired during the move.

| Check | Result |
|---|---|
| Deterministic package and manifest/link checks | Passed; 35 packaged skills with all references inside the package. |
| Node tests | 20 tests passed: target selection, per-client evidence decisions, source fingerprints/diffs, errors, isolated package references, generation drift, and compiled publication/model guards. |
| Live upstream comparison | Resolved live/forever/classic and reported no relevant changes against the initialized snapshots. |
| gh-aw v1.0.1 | Workflow compiled; generated YAML uses Copilot Sonnet for agent and detection with personal Copilot authentication and SHA-pinned actions/container images. |
| Codex CLI 0.166.0-alpha.5.1 | Isolated local marketplace registration, discovery, and plugin installation passed. |
| Claude Code 2.1.316 | Manifest validation and isolated installation passed; component inventory reports 35 skills and one agent. |
| Copilot CLI 1.0.105 | Isolated marketplace registration, browse, install, and enabled-plugin listing passed; 35 skills installed. |
| Existing Copilot checkout | Agent path/frontmatter, shared behavior and relative references validated statically. |

The machine's older Copilot CLI 0.0.362 does not expose plugin commands; a separate temporary 1.0.105 installation was used without upgrading the user's global CLI. Claude was also installed in a temporary tools directory. Host configuration tests used isolated profiles; the user's normal profiles were not changed. Codex reported a harmless refusal to create PATH helper aliases beneath the temporary profile, but plugin operations succeeded.

Claude's optional public-directory listing check warns that no icon is supplied. This repository marketplace does not submit a public-directory listing. Skill/manifest validation succeeds.

The workflow was migrated to personal GitHub Copilot billing. Its inference credential is the repository secret COPILOT_GITHUB_TOKEN; provider API-key requirements have been removed. The configured credential wiring and generated actions were reviewed. No credential value is logged or stored in the repository. Hosted inference still requires the maintainer to configure the secret and run the workflow; local compilation does not verify account entitlements or credit availability.

Not run: hosted GitHub Actions (requires merge and repository setup), Linux CI execution, model-based end-to-end addon generation, interactive VS Code selection, or in-game tests. Install/discovery and static checks do not establish actual game-runtime compatibility. Use [behavior scenarios](BEHAVIOR-SCENARIOS.md) and the [client checklist](../skills/wow-addon-development/references/CLIENT-VALIDATION.md) before addon releases.
