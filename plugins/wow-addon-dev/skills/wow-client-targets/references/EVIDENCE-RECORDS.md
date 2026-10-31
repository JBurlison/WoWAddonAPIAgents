# Capability evidence records

Use this contract when a skill, addon feature or compatibility adapter claims current support. A branch inventory is useful discovery evidence; it is not a support certificate. Keep the source commit aligned across the declaration, structures, TOC and implementation paths used for one conclusion.

## Required fields

| Field | Record |
|---|---|
| Identity | Target, source repository/commit, client version/build, exact function/event/method/callback name, review date and primary skill owner. |
| Declaration | Source path/line, namespace or receiver, environment, ordered arguments/returns or event payload. Preserve types, inner types, defaults, nilability and `MayReturnNothing`. |
| Types | Referenced enum/structure definitions at the same pin; nested fields and field-level access annotations. An optional return and a function returning no values are different declarations. |
| Loading | Owning Blizzard addon, TOC/XML selection, dependencies, load-on-demand/bootstrap state, and client/game conditions. Record an unresolved path explicitly. |
| Access | Declared secret arguments/results/fields, protected/secure restrictions and relevant context. Missing annotations do not independently prove unrestricted access. |
| Source state | `declared`, `not-found-in-reviewed-source`, or `unknown`, with reviewed scope. A source absence is not a removal claim. |
| Runtime state | `observed`, `not-observed`, or `not-tested`, with actual build, date, locale/platform, enabled addons, loaded modules and scenario. An absent load-on-demand global is not an unavailable feature. |
| Operation state | `passed`, `failed`, `restricted`, or `not-tested` for a named operation and context; preserve a separate result for each scenario. A successful existence probe is not an operation test. |
| Documentation | Canonical reference/example, remaining uncertainty and what evidence would resolve it. Link duplicate mentions to the canonical contract. |

For events, record validity, registration success and observed delivery separately. Payload declarations describe the source contract; an event not firing in a short session says nothing about other triggers. Lua `EventRegistry` callbacks and frame script handlers require their own registration/lifetime documentation and must not be entered as engine events.

## Interpreting combined evidence

| Combination | Permitted conclusion |
|---|---|
| Declared; no runtime capture | The selected source declares the contract. Runtime availability/access remains untested. |
| Runtime name present; no matching declaration | Name observed in that client/load state. Signature, origin and permitted operations remain unresolved. Check aliases, Lua-defined helpers, addon contamination and undocumented exports. |
| Declared and observed; no operation test | Contract and presence corroborated, but not sufficient to claim a feature works. |
| Operation passed in one scenario | That operation passed under the recorded conditions. Do not generalize to combat, instances, another class/client or other return fields. |
| Registration failed or result restricted | Record the error/restriction and context. Distinguish unsupported name, unloaded prerequisite, invalid arguments and protected access before assigning a reason. |

Keep historical records when a build changes. Label a removal only with adequate target-specific evidence; label a restriction by its actual context. Prefer explicit unresolved evidence over an inferred supported/unsupported boolean.

Use [runtime validation](../../wow-addon-development/references/RUNTIME-VALIDATION.md) for new observations. Static extraction and package tests can establish source consistency, not the game client's secure execution or event behavior.
