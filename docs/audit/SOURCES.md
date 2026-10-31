# Audit evidence and scope — 2026-10-31

This audit reviews the maintained `skills/wow-*/` Markdown, with the generated marketplace package checked separately for synchronization. Source presence, a textual mention, and tested addon behavior are three different things. None of the inventories in this directory certifies in-game availability.

## Pinned upstream evidence

GitHub's connected read tool resolved all three branch heads on 2026-10-31. They matched the repository's existing `targets.json`; this audit does not advance that registry. Bulk source comparison used local shallow Git clones under ignored `.cache/api-audit/`, because the connector returns individual resources rather than a filesystem suitable for scanning thousands of files. No complete upstream tree is included in the deliverables.

| Target | Branch | Version | Pinned commit |
|---|---|---|---|
| Retail | `live` | 12.1.5.70688 | [d07eb00237d8891f153215db98a5df880a26cfe5](https://github.com/Gethe/wow-ui-source/tree/d07eb00237d8891f153215db98a5df880a26cfe5) |
| Forever | `forever` | 1.60.1.70532 | [ca8368f2f2380cbe696854f7f2646387c278a61b](https://github.com/Gethe/wow-ui-source/tree/ca8368f2f2380cbe696854f7f2646387c278a61b) |
| Classic progression | `classic` | 5.5.4.70631 | [e5d9b3a22c3f0f6f41ebac0e454f4969594261cf](https://github.com/Gethe/wow-ui-source/tree/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf) |
| Forever community runtime capture | kit `main` | Capture reports 1.60.1.69893, interface 16001 | [8dc297689059dd204bf8663a05aaa36d6a628b76](https://github.com/Thunderz96/forever-addon-kit/tree/8dc297689059dd204bf8663a05aaa36d6a628b76) |

The three interface values in the target registry are derived from versions, not newly observed in a running client. Commit dates, mirror publication dates, runtime capture dates, and client build dates must remain distinct.

## Requested source disposition

| Source | Access/result | How used; remaining limitation |
|---|---|---|
| [Gethe/wow-ui-source](https://github.com/Gethe/wow-ui-source) | GitHub connector metadata and local pinned source inspected | Primary extracted Blizzard definitions, event payloads, access annotations, TOC conditions and UI callers. A mirrored multi-client tree is broader than the addon-facing API for one client. |
| [Wowpedia API index](https://wowpedia.fandom.com/wiki/World_of_Warcraft_API) | Web reader returned 402; direct HTTP returned 403 | Contents could not be independently audited. Do not count the link as verified category or symbol coverage. |
| [Warcraft Wiki API index](https://warcraft.wiki.gg/wiki/World_of_Warcraft_API) | Web reader and direct HTTP returned 403 | Existing skills cite this site, but current page contents were unavailable during this audit. No claim of complete wiki parity is made. |
| [Townlong Yak builds](https://www.townlong-yak.com/framexml/builds) | Web reader unavailable; direct HTTP succeeded | Build listing corroborates Retail 70688. Classic lists 70579 with 70631 in its additional-build marker. Retrieved listing contains no Forever/1.60 section; it cannot substitute for the Forever branch. Individual Townlong source files were not exhaustively compared. |
| [WoW Forever Guides developer guide](https://wowforeverguides.com/addons/developers) | Guide and related pages inspected | Leads for beta behavior and conflicting observations. Claims are checked against dated captures and pinned source where possible; the guide is not a complete signature/event specification. |
| [Thunderz96/forever-addon-kit](https://github.com/Thunderz96/forever-addon-kit) | Commit pinned; capture, findings and probe implementation inspected | First-person runtime observations for older beta builds. Function-name inventory has no argument, return or event schema; captured globals include enabled addons. See [Forever findings](FOREVER-FINDINGS.md). |

## What completeness requires

1. **Generated declarations:** cover each in-scope function, event, ScriptObject method, enum and structure, or explicitly record why it is excluded. Preserve arguments, return fields, nilability, defaults, payload order and access annotations.
2. **Client loading and context:** follow TOC/XML dependencies, game-type/family selectors, load-on-demand modules, Glue versus game environments, and secure/tainted access. An `Environment = "All"` declaration does not establish addon permission or gameplay feature support.
3. **Non-generated APIs:** separately inventory relevant FrameXML globals, mixins, callbacks, Lua libraries, slash commands, secure templates, widget inheritance and XML schema. Their absence from generated documentation does not prove removal.
4. **Runtime evidence:** collect a clean, build-labeled client baseline; distinguish C/native functions, Blizzard Lua, libraries and third-party addons. Record startup state and loaded addons. Probe event validity and actual subscription separately, without bypassing protected or secret-value restrictions.
5. **Skill ownership and examples:** route every supported system to one owner, keep cross-links consistent, and run representative addon scenarios on each claimed client. A file-existence check or a textual function mention does not satisfy this step.

The generated coverage reports are a repeatable missing-name screen. Manual findings validate selected high-impact signatures and examples; they are not an exhaustive semantic review of every listed API. No game client was exercised for this audit. The blocked wiki pages and unprobed runtime behavior remain explicit gaps.
