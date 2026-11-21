---
name: wow-curseforge-packaging
description: Configure CurseForge WoW addon projects, .pkgmeta files, packaging webhooks, multi-client CI uploads, and release ZIP diagnostics.
---

# CurseForge setup and automatic packaging

Work in the user's addon repository. Identify the CurseForge project, selected [WoW clients](../wow-client-targets/SKILL.md), addon folder, and release process. Inspect existing PackageMeta files, TOCs, tags, and CI upload steps. Never configure both the hosted packaging webhook and a CI upload workflow to publish the same tag twice.

## 1. Choose the publishing architecture

Use [PackageMeta and ZIP layout](references/PACKAGE-LAYOUT.md) to pick the right mode before creating webhooks:

- **Single-client Git-root repo (or single-TOC addon):** Use `.pkgmeta` (`package-as`) + the CurseForge repository packaging webhook.
- **Multi-client `src/` → `dist/<target>/` build (Retail, Forever, Classic):** Keep one archive per target client per [multi-client layout](../wow-addon-development/references/MULTI-VERSION-ADDONS.md). If the hosted packager cannot emit and label separate per-client ZIPs from your layout, **skip the hosted webhook** and publish each verified archive from CI via `BigWigsMods/packager` or `POST https://wow.curseforge.com/api/projects/{projectId}/upload-file` with explicit game-version IDs. (If CurseForge lacks a matching game version for Forever or another target, retain its local ZIP and document the publication gap.)

Check that each CurseForge game-version entry matches the target client/patch — a TOC `## Interface` number and a CurseForge game-version ID are separate identifiers.

## 2. Connect the CurseForge project

1. For a new listing, choose **World of Warcraft** in the CurseForge author dashboard and prepare the name, summary, description, logo, category, and matching license (new projects need an initial file submitted for moderation). For an existing listing, reuse its numeric **Project ID** (and optionally record `## X-Curse-Project-ID` in the TOC). [Creating a project](https://support.curseforge.com/support/solutions/articles/9000197241-creating-and-submitting-a-project)
2. In the project's repository/packaging settings, confirm the source repository URL and whether untagged commits should create alpha builds or only version tags should trigger builds.
3. **Only for webhook-managed repos:** Generate a CurseForge **author API token** and add a GitHub push webhook (**Settings → Webhooks**) or Bitbucket push webhook with the URL below in private host settings. Never commit tokens or log full URLs in files, chat, or screenshots. [Author tokens](https://www.curseforge.com/account/api-tokens) · [Automatic packaging](https://support.curseforge.com/support/solutions/articles/9000197281-automatic-packaging)

```text
https://www.curseforge.com/api/projects/{projectID}/package?token={token}
```

For setup-only tasks, deliver the repo config and remaining dashboard steps without forcing a tag push or manual POST unless a live build was requested.

## 3. Verify a release or diagnose a missing file

| Intended channel | Trigger to check |
|---|---|
| Alpha | An untagged push in all-commits mode, or a pushed tag such as `v1.4.0-alpha1`. |
| Beta | A pushed tag containing `beta`, such as `v1.4.0-beta1`. |
| Release | A plain version tag such as `v1.4.0`. Verify the resulting release type in Files. |

Confirm the remote tag points to the intended commit, inspect the repository host's recent **push** delivery response, and verify the CurseForge **Files** entry (review status, channel, and game versions). Download the built ZIP and inspect it (`tar -tf <archive>.zip`) to confirm the addon root folder, exact file casing, and `@project-version@` substitution. In-game loading remains a separate [client check](../wow-addon-development/references/CLIENT-VALIDATION.md). [File types](https://support.curseforge.com/support/solutions/articles/9000197242)

If a file is missing, check the remote ref, packaging mode, project ID, token validity, source access, and webhook delivery status before retrying (a file under moderation already reached CurseForge). Only trigger a manual POST after fixing the root cause. [Manual trigger](https://support.curseforge.com/support/solutions/articles/9000203228-manually-triggering-the-auto-packager)
