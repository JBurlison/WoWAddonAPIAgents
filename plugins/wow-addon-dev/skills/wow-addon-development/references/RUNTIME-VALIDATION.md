# Runtime capture and capability validation

Use this procedure for a new client, a port, an availability dispute or a source/runtime inventory difference. It produces evidence about the actual operation needed by an addon. It does not require dumping the entire client or calling every exposed function.

## Capture a reproducible baseline

1. Select the target and pin its source once. Record actual `GetBuildInfo()` version/build/date/interface, project constants, locale, operating system, capture date and probe addon revision. Do not overwrite the source build with the runtime build if they differ.
2. Use a test profile with other third-party addons disabled, retaining their files/settings. Keep the probe and necessary Blizzard addons. Record enabled and loaded addons, dependencies, load-on-demand states, and whether this is first login or reload. If reproducing an interaction requires another addon, make that a separate named run.
3. Begin after the probe's initialization and login lifecycle, then repeat only for relevant later states: dependency loading, zone/instance changes, combat transitions or the UI action that triggers the feature. Do not assume all Blizzard load-on-demand helpers exist at login.
4. Capture names/types of the specific namespaces/functions needed, without invoking arbitrary functions by naming convention. Broad `_G` captures need origin filtering: probe globals, addon/library globals, frames, mixins and engine APIs are different categories. Do not turn an addon-defined compatibility shim into evidence of an engine export.
5. Persist only the diagnostic record using the probe's own SavedVariables. Verify that it survives the intended save/reload/restart cycle before using an empty file as evidence. Keep user settings untouched; no external saved-variable bridge is needed merely to capture availability.

The [early Forever capture](https://github.com/Thunderz96/forever-addon-kit/blob/8dc297689059dd204bf8663a05aaa36d6a628b76/data/forever_api.json) is an example of why provenance matters: it identifies build 69893 but contains third-party global names and no event/signature records. Use it as historical observation, not a clean or current engine manifest.

## Probe a capability without conflating outcomes

| Stage | Record | Interpretation |
|---|---|---|
| Declaration | Pinned signature, nested types, environment, loading and access annotations | Source contract only. |
| Presence | Namespace/receiver/member found or absent at the recorded load state | A name exists; semantics and permission remain unresolved. |
| Valid operation | Known valid input, intended user action and expected result shape | Test only operations required by the feature. Avoid mutation during an inventory capture. |
| Restriction | Actual protected-action, taint or secret-value outcome in that context | Preserve the restriction; do not retry via a route intended to reveal protected data. |
| Lifecycle | Repeat after the relevant load/zone/combat/persistence transition | A pass in one state does not cover another. |

`pcall` can isolate a diagnostic Lua error. A successful `pcall` does not establish that a protected operation ran, and grants no additional permission to inspect returned values. Do not compare, serialize, stringify or enumerate secret results to prove that they were received. Record the restriction/category rather than its contents, using documented access checks and allowed widget paths where appropriate.

## Event verification

Use an explicit event allowlist derived from the selected source and intended feature. A blanket `RegisterAllEvents` capture is not a complete event catalogue: it observes only exercised triggers, can collect unrelated user data, and does not establish full payload variants.

For each engine event, record these independently:

| Check | Procedure |
|---|---|
| Name validity | Where supported, call `C_EventUtils.IsEventValid(eventName)` with the known literal. Record API absence separately. |
| Event category | Inspect `C_EventUtils.IsCallbackEvent(eventName)` where relevant and the source registration path. This does not convert a Lua `EventRegistry` callback into a frame event. |
| Subscription | Register on an isolated diagnostic frame; record error/success and unit-filter choice. An unknown/restricted event must not abort the rest of the probe. |
| Delivery | Perform a documented trigger and record whether/when the callback ran. A subscription success is not delivery evidence; no observed delivery is not proof of removal. |
| Payload | Compare permitted argument count/types and source schema. Keep optional/trailing nil and restricted values distinct; do not record names, chat, GUIDs or other content merely to validate a shape. |
| Cleanup | Unregister diagnostic subscriptions after the scenario and ensure handlers do not accumulate on repeated tests. |

The [70532 EventUtils declaration](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/EventUtilsDocumentation.lua) gives both queries a `stringView` event name and non-nil boolean return, with `SecretArguments = "AllowedWhenUntainted"`. Verify these helpers independently for other targets. The generated event's payload/access/delivery flags remain authoritative source evidence; the runtime run confirms only its recorded scenario.

For Lua callbacks, identify the owning addon, registry, owner argument, emitted payload and disposal path. Use that registry's API. For example, [Forever Legacy](../../wow-api-talents/references/FOREVER-LEGACY.md) uses `Legacy.*` callbacks emitted by its UI, alongside separate engine events for traits and achievements.

## Reconcile source and runtime

Join exact qualified symbols without collapsing globals, namespaced functions and object methods. Preserve per-function namespace overrides, aliases and environment conditions. Classify source-only and runtime-only names as review queues:

- Source-only: check build drift, internal/secure access, platform, Glue versus in-game environment, game-type exclusions and unloaded modules.
- Runtime-only: check Lua-defined helpers, aliases, incomplete generated docs, addon contamination and capture/source build mismatch.
- Shared name: compare the actual contract and access; matching names do not prove matching signatures.

Store the raw observation separately from the interpretation. Use the [capability evidence fields](../../wow-client-targets/references/EVIDENCE-RECORDS.md), including `not-tested` and unresolved results. Never label a generated-file absence or an unexercised event as removed.

## Minimum client acceptance report

| Record | Required detail |
|---|---|
| Build/context | Target, source SHA, actual build/interface/project, date, platform/locale, enabled addons and loaded dependencies. |
| Scenario | Feature, inputs, character/zone/combat state that matters, trigger and expected result. Avoid character-identifying data. |
| Outcome | Declaration, presence, validity/subscription/delivery and operation results separately; pass/fail/restricted/not-run with evidence. |
| Persistence | `/reload`, clean logout/login, full restart and migration results, only where the addon persists data. |
| Limits | Untested client/build/context, missing prerequisite, unresolved access or absent runtime access. |

For Forever, include project-ID validation, pre/post load-on-demand behavior, and the specific feature tests: Legacy locked/unlocked and staged/committed data; swing event/range-state behavior; or damage-meter/opaque-duration display paths as relevant. Test secure snippets only when the addon needs them, using a minimal owned frame and actual snippet behavior; testing whether `loadstring_untainted` remains global is invalid. See [Forever defect history](../../wow-client-targets/references/FOREVER.md).

When no game client is available, report source/static validation as completed and each runtime acceptance scenario as not-run. Do not manufacture a capture or convert a source declaration into a runtime pass.
