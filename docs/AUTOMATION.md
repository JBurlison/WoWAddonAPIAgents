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

The pre-agent check paginates open PRs and defers when an in-repository `[wow-api-update]` PR exists. Otherwise it resolves the three branches to commits and compares source fingerprints covering Lua/XML/TOC/XSD/text files under Interface plus version.txt. Truncated trees fail closed; unrelated changes do not trigger inference.

The ignored `.cache/upstream-report.json` contains old/new metadata, complete changed paths, and source comparison links. Copilot reviews pinned evidence and edits affected WoW guidance. Only complete review allows metadata to advance. It regenerates the package and runs checks; a post-agent step independently validates before safe outputs publish a draft PR.

The output allowlist permits WoW Markdown knowledge, target metadata, corresponding generated files, and the release version files. The deterministic version script synchronizes patch versions before the safe-output request; a separate post-step checks the version and rejects non-version metadata or dependency edits before publication. Scripts, workflows, maintenance tools, and security configuration remain excluded. Upstream text is evidence, never executable instructions.

Version bumps and post-merge release publication use separate deterministic workflows and the built-in repository token; they do not consume Copilot credits. See [versions and releases](RELEASING.md).

While an update PR awaits review, new proposals defer. After merge the next run catches intervening upstream changes. Closing without merging allows the same changes to be proposed again; disable the workflow in Actions to pause updates.

GitHub-token-authored PRs may not trigger ordinary PR workflows, so validation runs before publication. Maintainers can also dispatch **Validate toolkit** against the proposal branch. No game-client tests run in Actions.

## Compilation

```sh
gh extension install github/gh-aw --pin v1.0.1
npm run compile:workflow
npm run check:workflow
```

Commit compiler pin/config files with the lock YAML. Compiler lookups may require GitHub authentication. `GH_AW_BIN` supports a standalone pinned compiler. Review newly requested secrets/actions before approving a compiler safe-update change; the normal check command does not auto-approve changes.

On failures, inspect Actions logs. Verify secret/model access for authentication errors; do not substitute a larger model. For evidence or validation failures, keep committed snapshots unchanged and retry or correct the content. For a successful no-op, logs identify unchanged sources or pending review.

References: [Copilot engine](https://github.github.com/gh-aw/reference/engines/copilot/), [custom steps](https://github.github.com/gh-aw/reference/steps-jobs/), [PR safe outputs](https://github.github.com/gh-aw/reference/safe-outputs-pull-requests/).
