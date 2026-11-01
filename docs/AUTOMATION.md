# Upstream automation

[Workflow source](../.github/workflows/update-wow-api.md) is compiled with **gh-aw v1.0.1**. Its lock YAML runs daily at **09:17 UTC**, with manual dispatch available. GitHub can delay scheduled runs.

## Activate

1. Create a fine-grained GitHub PAT owned by your personal account with **Account permissions → Copilot Requests: Read**. The account needs an active Copilot license and Sonnet access. Save it as repository Actions secret `COPILOT_GITHUB_TOKEN` under Settings → Secrets and variables → Actions. Never commit the token or paste it into a chat.
2. Enable Actions and allow Actions to create pull requests, subject to organization policy.
3. Merge workflow source, compiled lock, and compiler pin files to the default branch. Manually run **Update WoW API knowledge** to verify authentication and permissions.
4. Review draft PRs and validation evidence before merging. There is no automatic merge or release publication.

Inference uses the token owner's Copilot plan and available credits. No separate OpenAI or Anthropic API key is needed. The ordinary `GITHUB_TOKEN` handles repository reads and safe-output PR creation; it does not use your personal Copilot subscription for inference.

Running inside your own repository does not remove this authentication requirement: Actions' built-in token represents the workflow, not your personal Copilot entitlement. Keep `COPILOT_GITHUB_TOKEN` for personal-license billing. Secretless inference through `permissions: copilot-requests: write` is available for eligible organization subscriptions with centralized billing, not personal credits. [Authentication modes](https://github.github.com/gh-aw/reference/auth/).

The 20-minute timeout limits runtime, not credits. Agent and threat-detection passes both use Copilot's `sonnet` model alias, which resolves to an available Sonnet version rather than escalating to another model family. No-change and outstanding-PR checks do not invoke a model. Missing credentials, unavailable model access, or network failures produce errors without advancing snapshots.

This personal-license configuration deliberately does not set `copilot-requests: write`: that permission selects organization-billed inference and ignores the personal token. A future migration to centralized organization billing must update both workflow permissions and the credential preflight. See [gh-aw authentication](https://github.github.com/gh-aw/reference/auth/).

## Update behavior

The deterministic pre-activation check paginates open PRs and defers when an in-repository `[wow-api-update]` PR exists. Otherwise it resolves the three branches to commits and compares source fingerprints covering Lua/XML/TOC/XSD/text files under Interface plus version.txt. Truncated trees fail closed; unrelated changes do not trigger inference. Its `--gate` mode writes `review_required` through GitHub step/job outputs, without creating a safe-output message. Only `true` activates the remaining workflow; unchanged sources and pending review finish before model, container and threat-detector setup. This uses the pinned compiler's [pre-activation steps and outputs](https://github.com/github/gh-aw/blob/0627fdbe4beb5f3b71aa569f8d97150b87f2111a/docs/src/content/docs/reference/triggers.md#L773).

For activated runs, a pre-agent recheck reconstructs the candidate report in the agent job's workspace and catches intervening changes or a newly opened update PR. It explicitly receives the compiler's `GH_AW_SAFE_OUTPUTS` path and creates its parent directory before appending any no-op result. Custom steps do not inherit the later harness step's environment or directory setup. The harness consumes that result and skips the update agent; the preflight's `review_required` output also skips proposal validation when no review is needed. A missing output configuration or failed upstream request remains an error, never a successful no-change result. This follows the pinned compiler's [runtime path handoff](https://github.com/github/gh-aw/blob/0627fdbe4beb5f3b71aa569f8d97150b87f2111a/pkg/workflow/compiler_yaml_step_generation.go#L346) and [no-op contract](https://github.com/github/gh-aw/blob/0627fdbe4beb5f3b71aa569f8d97150b87f2111a/docs/src/content/docs/reference/cost-management.md#L175). A no-op detected only by this later recheck still goes through framework setup and threat detection; the early gate avoids that work for ordinary no-change runs.

The ignored `.cache/upstream-report.json` contains old/new metadata, complete changed paths, and source comparison links. Copilot uses `node scripts/prepare-api-sources.mjs --candidates` to acquire the report's exact SHAs in `.cache/api-audit/{retail,forever,classic}` without changing the registry. The preparer rejects stale reports, unexpected origins/configuration, dirty worktrees and version mismatches; it disables checkout hooks and inherited Git configuration. It fetches source data without executing upstream Lua or installing upstream dependencies.

Only complete source/loading review allows target metadata to advance. After updating `targets.json`, the agent prepares those final pins, assigns added source files/groups in `config/api-owners.json`, and runs `node scripts/generate-api-references.mjs`. This regenerates per-domain declaration JSON, symbol/manifest catalogs, namespace/domain routes and central event tables. A new registry commit cannot retain references generated from its previous pin. `--check` validates the committed schemas, ownership, links/hashes, registry agreement and selected semantic contracts without network access; `--verify-source` independently compares them to the prepared source checkouts. A semantic contract change requiring validator edits is reported for maintainer work instead of weakening checks in an automated update.

The output allowlist permits WoW Markdown knowledge, target metadata, the explicit ownership map, exact generated reference/catalog paths, corresponding package copies, and release version files. It does not permit arbitrary JSON or script changes. The deterministic version script synchronizes patch versions before the safe-output request; a separate post-step rejects changes or new files in trusted script/test/workflow paths, checks version-only metadata edits, acquires final pinned sources, repeats offline and source-derived reference verification, and runs package checks/tests before publication. Scripts, workflows, maintenance tools, and security configuration remain excluded from update output. Upstream text is evidence, never executable instructions.

Version bumps and post-merge release publication use separate deterministic workflows and the built-in repository token; they do not consume Copilot credits. See [versions and releases](RELEASING.md).

While an update PR awaits review, new proposals defer. After merge the next run catches intervening upstream changes. Closing without merging allows the same changes to be proposed again; disable the workflow in Actions to pause updates.

GitHub-token-authored PRs may not trigger ordinary PR workflows, so validation runs before publication. Maintainers can also dispatch **Validate toolkit** against the proposal branch. No game-client tests run in Actions.

## Source roles and review cadence

| Evidence source | Cadence / trigger | Allowed conclusion |
|---|---|---|
| Gethe source mirror | Existing daily job, plus manual dispatch | Pinned declarations, schemas, annotations and UI loading paths. Source presence is not runtime addon permission. |
| Forever addon-kit | Supplemental review for an affected capability/build or an explicit maintainer request | Dated observations in that captured client/addon-load context. Preserve build and contamination limits; a name-only dump cannot supply signatures or events. |
| Townlong-Yak build/source pages | Corroboration when investigating a build or source discrepancy | What the retrieved build listing/source actually shows; absent Forever listings do not establish absent APIs. |
| Developer guides and wiki references | Research leads during feature review; record access failures and source dates | Navigation and dated community claims to verify against primary source or runtime evidence. |

No additional recurring automation is created for supplemental sources. Keep source-declared, runtime-observed, operation-tested, unavailable-with-evidence and unresolved states separate. A newer guide, capture or source timestamp does not automatically promote an existing claim to verified runtime support.

## Compilation

```sh
gh extension install github/gh-aw --pin v1.0.1
npm run compile:workflow
npm run check:workflow
```

Commit compiler pin/config files with the lock YAML. Compiler lookups may require GitHub authentication. `GH_AW_BIN` supports a standalone pinned compiler. Review newly requested secrets/actions before approving a compiler safe-update change; the normal check command does not auto-approve changes.

On failures, inspect Actions logs. Verify secret/model access for authentication errors; do not substitute a larger model. For evidence or validation failures, keep committed snapshots unchanged and retry or correct the content. For a successful no-op, logs identify unchanged sources or pending review.

If Sonnet alias resolution reports `catalog_unavailable`, inspect the preceding model-catalog request status. The 2026-11-01 verification encountered HTTP 401 from the Copilot proxy's models endpoint: the update agent had skipped correctly, but the framework attempted threat detection on its no-op message. The pre-activation gate removes this dependency for ordinary no-change runs; it does not repair provider authentication for real updates. Check the configured personal Copilot credential and model access rather than treating an overall green run or missing detection verdict as proof that inference works.

References: [Copilot engine](https://github.github.com/gh-aw/reference/engines/copilot/), [custom steps](https://github.github.com/gh-aw/reference/steps-jobs/), [PR safe outputs](https://github.github.com/gh-aw/reference/safe-outputs-pull-requests/).
