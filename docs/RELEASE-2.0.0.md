# Marketplace 2.0.0 implementation and validation

Prepared 2026-10-31. The requested major version change is **1.0.1 → 2.0.0** across the root package/lock, plugin configuration, all plugin manifests and versioned marketplace entries. Validation below concerns the rebuilt local package. GitHub release publication is handled separately by the release workflow after merge.

## Documentation delivered

The [filled gap matrix](audit/GAP-MATRIX.md) records all 17 findings and distinguishes implemented documentation from outstanding runtime/external-source evidence. High-priority fixes cover damage meters, duration-object cooldowns, cooldown event payloads, taint/secrets and restricted values. New Forever guides cover current identity and beta history, GameRules/presets, swing timers, Legacy loading/currency/rewards/callbacks, and clean runtime validation.

The [source-schema catalogue](../skills/wow-api-index/references/CURRENT-REFERENCES.md) contains every generated declaration from the three pinned snapshots:

| Target | Build | Functions | Events | Object methods | All declarations, including types/predicates |
|---|---|---:|---:|---:|---:|
| Retail | 12.1.5.70688 | 4,970 | 1,784 | 1,470 | 9,981 |
| Forever | 1.60.1.70532 | 5,140 | 1,814 | 1,477 | 10,250 |
| Classic progression | 5.5.4.70631 | 3,231 | 1,483 | 1,360 | 7,435 |

The 27,666 records overlap across builds; they are not distinct addon-accessible APIs. All 653 source systems and 654 distinct source files have explicit owners. The package includes 86 domain/target data chunks, complete namespace/system routing, populated event navigation and a portable query tool. Nested contracts preserve defaults, nilability, enums, callback types and security annotations. Original upstream prose is linked rather than copied.

Settings registration and SavedVariables now have a concrete lifecycle example; input, audio/video, Edit Mode and build/time APIs have source routes and boundaries. UI guidance pins schema/template/load paths and separates native inheritance, Lua mixins, XML templates and callback registration. The updater prepares exact source commits, regenerates references with pins, checks unknown ownership and semantic regressions, and protects executable tooling before running validation.

## Validation performed

| Check | Result |
|---|---|
| `npm run build` | 277 generated files rebuilt. |
| `npm run check` | 277 outputs verified; all 35 packaged skills, manifests, registry, workflow policy and local links passed. Includes offline reference validation. |
| `npm test` | **42/42 passed**, no skipped tests. |
| `npm run references:verify-source` | All 123 generated reference/navigation artifacts match exact pinned source checkouts. |
| `node scripts/version.mjs check HEAD` | Version policy passed: 1.0.1 → 2.0.0. |
| Skill-creator frontmatter checks | All 35 entry points validated; corrected XML description markup rejected by the skill validator. |
| Pinned gh-aw v1.0.1 compile and compiler drift check | Passed, including updated allowlists and trusted-script guards. |
| Source acquisition | All three existing caches verified; independent clean exact-SHA Forever acquisition passed. |
| Independent reference review | Representative nested fields, defaults, restrictions, namespace overrides and callback flags checked against Forever source; portable query checks passed. |
| Independent Settings forward review | No material documentation ambiguity found; 31 pinned source paths checked. Static prototype only. |
| Archive and installation smoke test | ZIP integrity passed; all 271 packaged files included, including hidden manifests. Extracted package queried successfully from an unrelated directory with spaces in its install path. |

The extracted-package checks exercised Forever swing payloads, duration-object returns across all targets, five-versus-four cooldown event fields, all eight damage-meter functions, and bounded widget-method lookup. They also confirmed all packaged manifest versions and preserved unknown addon-access status.

## Local artifact

The ignored `dist/wow-addon-dev-2.0.0.zip` is a self-contained plugin archive, 2,339,440 bytes, with the `wow-addon-dev/` prefix and normalized ZIP metadata. `dist/SHA256SUMS` and `dist/validation-2.0.0.json` record its integrity and smoke-test result.

SHA-256: `97379dcee7c1de74679af845d32e4271efb31785b116779a05d8d5cae0411620`.

Normal marketplace installation uses the rebuilt, committed `plugins/wow-addon-dev` tree and repository catalogs. Publishing follows the existing [release workflow](RELEASING.md) after merge; this local archive includes the current workspace changes and is not a published release.

## Evidence still needed

No WoW client was run. Runtime availability, event registration/delivery, addon permission, actual protected operations and persistence behavior remain untested unless separately evidenced in a guide. The old addon-kit capture is not a clean current-build acceptance run. Long-tail handwritten helpers remain historical discovery material until their definitions and load paths are reviewed. Requested wiki content was inaccessible, so wiki/category parity remains unverified. These limits stay visible in the matrix and package; no source declaration is promoted to runtime certification.
