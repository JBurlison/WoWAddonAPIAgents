# PackageMeta and the installed addon

For a single-client addon with `MapNotes.toc`, `Core.lua` and `CHANGELOG.md` at the Git root, the following `.pkgmeta` wraps the runtime files in the installable `MapNotes/` folder. Adapt the name, paths and exclusions to the tracked tree at the release commit. CurseForge also accepts `pkgmeta.yaml` at the Git root and gives it precedence if both files exist. [PackageMeta reference](https://support.curseforge.com/support/solutions/articles/9000197952-preparing-the-packagemeta-file)

```yaml
package-as: MapNotes
enable-nolib-creation: yes
ignore:
  - README.md
  - docs
  - tests
  - tools
manual-changelog:
  filename: CHANGELOG.md
  markup-type: markdown
externals:
  Libs/LibStub:
    url: https://repos.wowace.com/wow/libstub/trunk
    tag: 1.0.2
  Libs/CallbackHandler-1.0:
    url: https://repos.wowace.com/wow/callbackhandler/trunk/CallbackHandler-1.0
    tag: 1.0.8
```

Use `## Version: @project-version@` and `## X-Curse-Project-ID: 123456` in the TOC so the packager stamps the tag/version and CurseForge links the project. Bracket development-only helpers with `--@debug@` ... `--@end-debug@` so release builds strip debug code while local checkouts still execute it. On a tagged build, inspect the packaged TOC for the resolved version; untagged builds use a short revision. Keep each target's verified `## Interface` independent of the addon version. [Replacement tokens](https://support.curseforge.com/support/solutions/articles/9000197281-automatic-packaging)

## Multi-module packaging and embedded libraries

- Use `move-folders` for a module installed as a sibling addon (`MapNotes_Retail/MapNotes_Retail: MapNotes_Options`, or moving nested `src/Modules/MapNotes_Options` out of `MapNotes/` to top-level `MapNotes_Options`). Paths in `move-folders` refer to the packaged tree, including its outer addon folder, and each moved folder needs its own matching TOC.
- Use `externals` to embed libraries directly into `Libs/` at the exact relative paths listed in the TOC or `embeds.xml` (`LibStub` first, then `CallbackHandler-1.0`, then Ace3/LibDBIcon libraries). Pin upstream tags rather than floating trunk when reproducible builds matter.
- Keep `## OptionalDeps:` and `## X-Embeds:` aligned, and use `enable-nolib-creation: yes` if shipping `-nolib` variants. `required-dependencies` and `optional-dependencies` in `.pkgmeta` only declare CurseForge website project relations—they do not embed files or configure WoW's TOC load order.
- Use `license-output` when the packager should emit the project license, keeping any required bundled library licenses. Use `ignore` for tests, docs, CI files, and source artwork while keeping runtime locale files, XML includes, `.tga`/`.blp` textures, and fonts in the archive. [PackageMeta directives](https://support.curseforge.com/support/solutions/articles/9000197952-preparing-the-packagemeta-file)

## Local validation and GitHub Actions packager

For CI-built ZIPs or local testing of substitution and multi-flavor ZIPs without pushing a tag, run [BigWigsMods/packager](https://github.com/BigWigsMods/packager) (container or GitHub Action) or inspect the output archive directly with `tar -tf MapNotes.zip`. Extracting `MapNotes.zip` into `Interface/AddOns/` must create `MapNotes/MapNotes.toc` and `MapNotes/Core.lua` at top level—never a nested repo folder, GitHub source archive, or `dist/forever/` wrapper. Verify exact filename casing against every TOC/XML include and check that replacement tokens expanded cleanly.

When using the CurseForge Upload API directly from CI:
- Query `GET https://wow.curseforge.com/api/game/versions` (and `GET https://wow.curseforge.com/api/game/version-types`) to resolve current `gameVersions` IDs, matching the WoW flavor type (`wow_retail`, `wow_classic`, `wow_burning_crusade`, etc.) as well as version string.
- Send a `POST https://wow.curseforge.com/api/projects/{projectId}/upload-file` multipart request with the `X-Api-Token` header (from CI secrets), multipart part `file`, and JSON part `metadata` containing `"changelog"`, `"changelogType": "markdown"`, `"displayName"`, `"gameVersions": [id, ...]`, and `"releaseType"` (`"alpha"` | `"beta"` | `"release"`). Record each returned file ID so a partial multi-client release can resume cleanly. [Upload API](https://support.curseforge.com/support/solutions/articles/9000197321-curseforge-upload-api)
