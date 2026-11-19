# PackageMeta and the installed addon

For a single-client addon with `MapNotes.toc`, `Core.lua` and `CHANGELOG.md` at the Git root, the following `.pkgmeta` wraps the runtime files in the installable `MapNotes/` folder. Adapt the name, paths and exclusions to the tracked tree at the release commit. CurseForge also accepts `pkgmeta.yaml` at the Git root and gives it precedence if both files exist. [PackageMeta reference](https://support.curseforge.com/support/solutions/articles/9000197952-preparing-the-packagemeta-file)

```yaml
package-as: MapNotes
ignore:
  - tests
  - tools
manual-changelog:
  filename: CHANGELOG.md
  markup-type: markdown
```

Use `## Version: @project-version@` in the TOC if the hosted packager supplies the version. On a tagged build, inspect the packaged TOC for the tag. Untagged builds use a short revision. Keep the target's verified `## Interface` independent of the addon version. [Replacement tokens](https://support.curseforge.com/support/solutions/articles/9000197281-automatic-packaging)

Choose additional directives to match the addon:

- Use `move-folders` for a module installed as a sibling addon. Paths in this mapping refer to the packaged tree, including its outer addon folder. Check each sibling has its own matching TOC.
- Use `externals` to include library files at the paths loaded by the TOC/XML. Select an appropriate upstream tag for reproducible embeds. Use `required-dependencies` or `optional-dependencies` for CurseForge project relations. An entry there neither embeds files nor sets WoW's TOC load order.
- Use `license-output` when the packager should emit the project license. Keep any required bundled library licenses. Use `ignore` for repository-only files and keep runtime locale files, XML includes, textures and fonts in the archive. [PackageMeta directives](https://support.curseforge.com/support/solutions/articles/9000197952-preparing-the-packagemeta-file)

Inspect a built ZIP with `tar -tf MapNotes.zip` or an archive viewer. In this example, extracting into `Interface/AddOns/` must create `MapNotes/MapNotes.toc` and `MapNotes/Core.lua` directly. A GitHub source archive, an extra repository directory or a nested `dist/forever/` wrapper changes that install path. Follow every file named by the packaged TOC and XML with exact casing, check substitution results, and confirm the package contains the intended client's modules.

For CI-built ZIPs, perform any version substitution during the build. When using the CurseForge upload API, resolve the WoW version IDs with `GET /api/game/versions` on the game's API host. Match the game-version type as well as its name. Upload the ZIP in multipart field `file` and its JSON `metadata` (including `gameVersions`, `releaseType` and `changelog`) to `POST /api/projects/{projectId}/upload-file`. Supply the author token from the CI secret store in the `X-Api-Token` header. Record each returned file ID so a partial multi-client release can resume with the missing artifacts. [Upload API](https://support.curseforge.com/support/solutions/articles/9000197321-curseforge-upload-api)
