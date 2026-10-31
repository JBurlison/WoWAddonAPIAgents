---
name: wow-api-events
description: Look up complete source-pinned WoW event declarations, ordered typed payloads, nilability, secrecy and callback-versus-frame dispatch across Retail, Forever and Classic progression. Verify addon-facing registration and runtime delivery separately.
---

# Events and payloads

Resolve the target with [wow-client-targets](../wow-client-targets/SKILL.md). Use the [current event contract guide](references/RETAIL-BASELINE.md) and the complete alphabetical catalogues below. These catalogues replace the historical partial lists; they cover every generated Event declaration at the pinned builds.

| Catalogue | Event names |
|---|---|
| [A–F](references/EVENTS-A-F.md) | Names beginning A through F |
| [G–L](references/EVENTS-G-L.md) | Names beginning G through L |
| [M–R](references/EVENTS-M-R.md) | Names beginning M through R |
| [S–Z](references/EVENTS-S-Z.md) | Names beginning S through Z |
| [Non-generated events and callbacks](references/EVENTS-UNDOCUMENTED.md) | Evidence policy and separate callback research |

Retrieve one full contract with `node <wow-api-index>/scripts/query.mjs forever SPELL_UPDATE_COOLDOWN --kind event`. The [query guide](../wow-api-index/references/CURRENT-REFERENCES.md) explains exact lookup, named payload structures and target comparison. Event payload records live with the domain that owns the event; the [EventUtils ledger](references/generated/README.md) contains this skill's own generated functions.

Preserve payload order, field types, nilability and secret-value annotations. `CallbackEvent` is not a frame-event subscription. `Environment = All` does not mean third-party addons can register an event. Validate registration, loading, restricted contexts and delivery in the selected client before declaring support. An absent generated event remains unknown, not removed.

For implementation and release acceptance, use [wow-addon-development](../wow-addon-development/SKILL.md).
