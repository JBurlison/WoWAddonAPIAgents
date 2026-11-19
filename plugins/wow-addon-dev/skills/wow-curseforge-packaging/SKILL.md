---
name: wow-curseforge-packaging
description: Set up a World of Warcraft addon project on CurseForge, configure its GitHub or Bitbucket packaging webhook, author .pkgmeta, and diagnose missing releases or incorrectly packaged client ZIPs.
---

# CurseForge setup and automatic packaging

Work in the user's addon repository. Identify the CurseForge project, selected [WoW clients](../wow-client-targets/SKILL.md), addon folder and release process. Inspect existing PackageMeta files, TOCs, tags and CI upload steps. If CI already publishes to the same project, keep one publisher per artifact so a tag cannot upload it twice.

## Connect the project

1. For a new listing, choose **World of Warcraft** in the CurseForge author dashboard. Prepare the addon name, summary, description, logo, category and matching license. For an existing listing, reuse its numeric **Project ID** from the overview. A new project needs a file submitted for moderation. [Creating and submitting a project](https://support.curseforge.com/support/solutions/articles/9000197241-creating-and-submitting-a-project)
2. In the project's repository/packaging settings, confirm the source repository the hosted packager can read and its packaging mode. Check whether the author wants pushed tags only or also wants alpha builds for untagged commits. A public source-code link alone does not establish that packaging is active.
3. Generate a CurseForge **author API token** for the webhook. In GitHub repository **Settings → Webhooks**, add an active push webhook. For Bitbucket, configure a repository push webhook that sends a POST. Enter the payload URL below in the host's private configuration. Substitute the actual project ID and token there. Keep the full URL out of files, chat, command history, logs and screenshots. [Author tokens](https://www.curseforge.com/account/api-tokens) · [Automatic packaging](https://support.curseforge.com/support/solutions/articles/9000197281-automatic-packaging)

```text
https://www.curseforge.com/api/projects/{projectID}/package?token={token}
```

For setup-only work, deliver the repository changes and any remaining dashboard steps. Use a real triggering push, tag or manual POST only when a live build is in scope.

## Choose what to ship

Use the [PackageMeta example and ZIP checks](references/PACKAGE-LAYOUT.md) when configuring the archive. For a single client, confirm that the tagged source packages directly into the intended addon folder. For multiple clients, preserve the [separate client distributables](../wow-addon-development/references/MULTI-VERSION-ADDONS.md). Verify each CurseForge game-version entry against the target client or expansion and patch. A TOC interface number and a CurseForge game-version ID are different identifiers.

For example, publishing Retail, Forever and Classic progression from shared Lua needs three checked archives. If the hosted packager cannot produce and label those outputs from the repository layout, use the addon's release build to stage each one. An existing CI publisher can submit each verified ZIP as a separate file with its own game versions. If the service has no confirmed match for Forever or another target, keep its ZIP available locally and report that publication gap. [CurseForge upload and game-version APIs](https://support.curseforge.com/support/solutions/articles/9000197321-curseforge-upload-api)

## Verify a release or diagnose a missing file

| Intended channel | Trigger to check |
|---|---|
| Alpha | An untagged push in all-commits mode, or a pushed tag such as `v1.4.0-alpha1`. |
| Beta | A pushed tag containing `beta`, such as `v1.4.0-beta1`. |
| Release | A plain version tag such as `v1.4.0`. Verify the resulting release type in Files. |

Check that the remote tag points to the intended commit. Inspect the repository host's recent **push** delivery and response, then the CurseForge project **Files** entry for that version, its review status, channel and supported game versions. A successful webhook response confirms delivery only. Download the resulting file when available and inspect its contents. Report what was actually observed. In-game loading needs its own [client check](../wow-addon-development/references/CLIENT-VALIDATION.md). [File types and release visibility](https://support.curseforge.com/support/solutions/articles/9000197242)

If a file is missing, check the remote ref, packaging mode, project ID, token validity, source access and delivery result before retrying. A file under review already reached CurseForge. If the expected build is genuinely missing after correcting a trigger failure, the documented manual POST can trigger packaging. Check Files again before any further attempt. [Manual packager trigger](https://support.curseforge.com/support/solutions/articles/9000203228-manually-triggering-the-auto-packager)
