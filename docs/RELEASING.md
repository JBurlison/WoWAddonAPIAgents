# Versions and releases

The plugin uses one stable `major.minor.patch` version. `config/plugin.json`, the root package and lockfile, all plugin manifests, and the Claude/Copilot marketplace entries must agree. The Codex catalog has no version field in its documented format; it reads the packaged plugin manifest. `npm run check` rejects mismatches.

## Pull requests

Once these workflows are on `main`, **Version plugin PRs** automatically patches every same-repository PR targeting `main` whose packaged `plugins/wow-addon-dev/` tree changes. It adds a version commit when the proposed version is no higher than current `main`. More commits on the same PR keep that version; an explicit higher minor/major version is preserved. Documentation-only and maintainer-only changes that leave the plugin unchanged do not trigger bumps.

The workflow also revisits open PRs after a push to `main`, so concurrent proposals are compared against the newly merged version. Update/rebase a branch if it has conflicts, then wait for validation of its latest commit. Configure branch protection to require current **Validate toolkit** package and compiler checks before merge. A manual **Version plugin PRs** run on `main` retries outstanding proposals.

The version job runs trusted code checked out from `main`. It reads PR Git trees and fixed JSON files through the API, updates only version fields, and makes a non-forced commit on the existing PR branch. It never installs dependencies or executes PR code with its write token. Unexpected file types, truncated trees, changed heads, and API errors fail closed. Fork branches are not modified; contributors use the command below.

```sh
npm run version:bump -- patch
npm run build
npm run check
npm test
node scripts/version.mjs check origin/main
```

Use `minor` or `major` instead for intentional feature or breaking releases. Commit the version changes with the package. Fetch the current `main` before checking; this command compares against the supplied Git ref.

The upstream WoW agent runs the deterministic version script before submitting its safe-output PR, including on runs that do not trigger ordinary PR workflows. A separate post-step checks the version and rejects changes to non-version release metadata and dependencies against the original checkout commit. Post-steps validate rather than mutate the already captured PR patch. The agent does not choose release numbers or publish releases.

## After merge

**Release plugin** runs on pushes to `main`. A version change publishes `v<version>` only after Windows and Linux package validation, tests, and pinned workflow-compilation checks succeed for that exact commit. The release includes generated GitHub release notes, `wow-addon-dev-<version>.zip` containing the self-contained plugin, and `SHA256SUMS`. GitHub also supplies source archives for the repository, including all marketplace catalogs. Marketplace installation continues to use the repository's committed package.

Publication creates the tag at the validated commit, prepares a draft release, uploads both assets, then publishes. Failed uploads leave a recoverable draft. Published assets and existing tags are never silently replaced or moved. Rerunning the same successful commit is a no-op. The existing historical `1.0.0` tag is left unchanged; new tags use the `v` prefix.

For a failed release, rerun the original Actions run to retry the same commit. A manual **Release plugin** run on `main` can recover a missing release if `main` still points at the intended release commit. If the tag belongs to a different commit, the workflow fails instead of repointing it; use the original run or a new version. A normal push with an unchanged version does not publish a release. Hosted publication can only be verified after this PR is merged.

## Permissions

No extra secret or Copilot credits are needed for versioning and releases. The version workflow uses built-in `GITHUB_TOKEN` with `contents: write`, `pull-requests: read`, and `actions: write`; the last permission explicitly dispatches validation after a bot commit. The release publication job uses `contents: write`, while validation remains read-only. Repository policies must permit these operations and tag creation. Configure required checks/rules according to your repository policy; these workflows do not bypass protections or merge PRs.

Token-authored pushes do not automatically start push workflows, and token-authored PR events may require approval. Explicit validation dispatch handles the version bot's commit; in-agent checks protect upstream update proposals. See [GitHub workflow triggering](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow) and [release creation](https://cli.github.com/manual/gh_release_create).

`COPILOT_GITHUB_TOKEN` is still needed only for the WoW research agent's personal Copilot inference, as described in [automation setup](AUTOMATION.md).
