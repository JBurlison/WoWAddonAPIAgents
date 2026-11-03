# 2.3.0: persistent addon plans and Forever refresh

The addon-development skill now creates or maintains a requirements document and implementation matrix for new addons and larger changes. The [planning reference](../skills/wow-addon-development/references/PROJECT-PLANNING.md) links two packaged templates. Records live in the user's addon repository, preserve stable requirement IDs and user decisions, map work to dependencies and owners, distinguish implementation from per-target acceptance, and keep a resumption checkpoint. Small isolated fixes can use concise existing notes. This workflow assumes no particular Ultracode, Hydrafusion or host memory integration.

## Reviewed source snapshots

Checked 2026-11-03 against the selected Gethe branches. Only Forever changed; all 118 relevant changed files were reviewed, including nine generated API definition files.

| Target | Previous → packaged build | Commit | Functions / events / object methods | All generated records |
|---|---|---|---|---:|
| Retail | 12.1.5.70688 → unchanged | `d07eb00237d8891f153215db98a5df880a26cfe5` | 4,970 / 1,784 / 1,470 | 9,981 |
| Forever | 1.60.1.70532 → 1.60.1.70707 | `aff0d8cd53bf4d9ef1c1dd2786b94461a276fb16` | 5,142 / 1,816 / 1,477 | 10,255 |
| Classic progression | 5.5.4.70631 → unchanged | `e5d9b3a22c3f0f6f41ebac0e454f4969594261cf` | 3,231 / 1,483 / 1,360 | 7,435 |

The [70707 migration guide](../skills/wow-client-targets/references/FOREVER-70707-CHANGES.md) records the preset setter split/Enhanced enum, settings-header and pet-order events, secret damage-meter icon fields, stricter loss-of-control and spell argument annotations, enum/constants changes, and loaded container/item-button/gamepad/PvP UI changes. Source hashes, declaration ledgers, event tables and packaged copies are regenerated together. Older audits and community runtime captures retain their original build scope.

## Updater publication

[Run 41609891350](https://github.com/JBurlison/WoWAddonAPIAgents/actions/runs/41609891350) completed authenticated inference, content validation and security review but could not publish its 146-file update under the default 100-file limit. The full patch was 12,492,340 bytes, also exceeding the pinned framework's maximum configurable 10,240 KiB.

The workflow now permits at most 300 files and 10,240 KiB. Symbol indexes use one tuple per line without changing their JSON schema, reducing a replay of that update to approximately 5,159 KiB. File allowlists, protected paths and independent validation remain in place. The current PR includes the source refresh directly; future updater runs use the new baseline after merge. The corrected hosted publication path has not yet been exercised.

## Validation and limits

| Check | Result |
|---|---|
| Package generation and offline validation | Passed: 35 skills and 284 generated outputs; packaged references and links verified. |
| Node tests | 65 passed, including isolated package lookup, target separation, generated-schema checks, publication budgets and small symbol-index diffs. |
| Pinned source comparison | All 123 generated reference artifacts match the exact source checkouts. |
| Packaged lookup smoke checks | New pet query/event, settings-header event, post-login preset setter and spell secrecy annotation returned the 70707 contracts. |
| Skill/source references | Skill frontmatter validation passed; 59 cited Forever source paths and line bounds resolved. |
| Final upstream comparison | No further relevant changes reported after the snapshot refresh. |

Source declaration, loaded Blizzard usage, addon permission and actual runtime behavior remain separate. No real-client, UIForever, Witchcraft or computer-use acceptance was performed for these source changes, and no installed host's memory behavior is certified by the planning documents. The [behavior scenarios](BEHAVIOR-SCENARIOS.md) include long-request, scope-change, resumption and missing-evidence cases for host acceptance.
