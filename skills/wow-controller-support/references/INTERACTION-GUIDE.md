# Controller interaction guide

## Make the interaction explicit

For each selected client, record an element's owner, input strategy, primary/back actions, navigation neighbors, focus appearance, current-binding hint, unavailable state and verification status. Group identical repeated controls, but include their changing data and lifetime. Extend the existing requirements and implementation records instead of maintaining a competing project tracker.

| Element | Required decisions |
|---|---|
| Window, tab, modal | Initial focus; return focus; tab/page movement; close/back precedence; which owner consumes input |
| Button, checkbox, dropdown | Reachable focus; primary action; selected/disabled distinction; secondary action or context menu without right-click dependence |
| List/grid and recycled row | Stable item identity; scroll-to-focus; boundaries; filtering/sorting/recycling; empty/loading states |
| Slider/scrollbar | Small and large adjustments; bounds; readable value; no accidental navigation while editing |
| Edit box/search | Enter/leave text editing; confirm/cancel; keyboard fallback; no navigation capture of typing; virtual keyboard only where verified |
| Tooltip/help/error | Equivalent focused presentation; readable placement; no action available solely through pointer hover |
| Border, texture, focus ring | No input interception; visible focus over the chosen skin; no clipping or false focusable decoration |
| Protected gameplay control | Verified secure hardware action path and combat behavior; explicit unavailable state when unsupported |

Prefer semantic actions such as Select, Back, Previous Tab and Scroll. Resolve their **current effective binding in the active context** before rendering text or glyphs. Never label a physical brand button as a universal Select/Back key. Refresh when bindings, active owner, input mode, device, or label style change. Unbound, shadowed or unavailable actions must not advertise an actionable glyph. Use a clear text fallback when a verified glyph resolver is unavailable.

## Keep input and focus ownership bounded

Device connection, gamepad subsystem enablement, last active device, and a window's current input mode are different states. Query supported state at initialization, then subscribe to verified updates. A connection event alone does not mean an open window should take focus. Do not change CVars, global bindings, targeting settings or cursor behavior merely to make the addon work.

Separate a reachable, narrowly scoped acquisition action from broad navigation capture. The [focus acquisition guide](FOCUS-ACQUISITION.md) covers inactive windows, current native focus bindings, paired release and diagnostics. Activate broad capture only while its owner is eligible, shown, focused and in the appropriate mode. Release it on hide, disable, modal takeover, screenshot/native-chat handoff, mode change or disconnect, following the selected client's restrictions. Handle opening before and after native owners load, including already-loaded owners and late-created controls. Keep setup idempotent; avoid duplicate hooks/listeners. Cleanup must remove only this addon's registrations.

Define one current focus and directional neighbors among eligible controls. Skip hidden, disabled and decorative controls. Give menus/popups priority within their own scope; only the top modal navigates. Back cancels pending composition or the innermost interaction before returning through the view's existing navigation and closing its parent, restoring valid previous focus. Re-evaluate focus after a tab change, sort, resize, filter, row release or data refresh.

Register ordinary controls through shared widget creation/render lifecycles; give exceptional controls explicit adapters, including models, map markers, chart details and nested dialogs. Identify targets by semantic owner, view, record and control role, with a render generation/token. A label or pooled frame pointer is insufficient. Before activation, tooltip inspection or asynchronous completion, check that the owner/record objects are still the current entries as well as matching their IDs: same-ID replacement can invalidate an action before redraw. Remove stale callbacks on release and reject captured old callbacks if they still run.

Retain semantic selection across redraws while mouse interaction is active, but do not scroll the mouse user's page just to restore inactive controller focus. Reveal the control when controller interaction resumes. After free scrolling moves the focused control offscreen, reveal it before accepting activation so an invisible action cannot fire. Restore to a valid neighbor or initial target when the original disappears.

For skins, retain native click targets, scripts, focus decoration and layout ownership. Cosmetic overlays should not become input owners. Preserve existing controller navigation unless a verified, explicitly designed change is required. Inspect native lifecycle callbacks before composing a hook; an ordinary callback can taint a secure focus stack.

## Implement through a small target adapter

Separate the interaction model from WoW input delivery. This original Lua example models navigation for an addon-owned ordinary settings panel; it does not install bindings, simulate clicks or perform protected actions:

```lua
local controls = {
    profile = { right = "apply", down = "close", visible = true, enabled = true },
    apply = { left = "profile", down = "close", visible = true, enabled = true },
    close = { up = "profile", visible = true, enabled = true },
}
local focused = "profile"

local function MoveFocus(direction)
    local candidate = controls[focused] and controls[focused][direction]
    local seen = {}
    while candidate and not seen[candidate] do
        seen[candidate] = true
        local control = controls[candidate]
        if not control then return focused end
        if control.visible and control.enabled then
            focused = candidate
            return focused
        end
        candidate = control[direction]
    end
    return focused
end
```

Supply visibility/enabled state from the addon's ordinary, nonsecret model. A separately verified adapter delivers direction actions and paints focus on addon-owned controls. Selection invokes the same ordinary settings operation as mouse/keyboard; it must not run a native protected button's `OnClick` script to impersonate hardware input. Restore a valid initial focus when the current entry disappears. For a cursor-based adapter, provide reachable controls and focused/hover help without claiming this graph is active.

In Forever, inspect the source-map's SmartNavigation utility setters, ownership manager, dialog lifecycle and prompt infrastructure before selecting integration points. Prefer a verified utility entrypoint over direct writes to `smartNavigation*` fields. The native secure helper validates specific keys/calls and rejects secrets; it is not a mechanism addons should reproduce or extend. Internal manager tables, high-priority callbacks and direct secure-only methods are not a general addon API. Setup permitted outside the relevant restriction does not establish permission during combat.

For Retail and Classic, independently verify frame gamepad scripts/methods and cursor/binding facilities. Do not import Forever's manager or templates. `EnableGamePadButton`/`EnableGamePadStick` are declared protected in all three inspected clients; inspect the exact frame and context before enabling capture. Down/up handling must account for consumed input and a frame losing ownership before release; avoid stuck state or double action. Keyboard propagation APIs are not evidence of gamepad propagation behavior.

Controller input does not waive combat lockdown, taint, secret values, protected attributes, or secure-action requirements. The inspected input declarations restrict mouse simulation to limited hardware input and eligible mouse-focus frames. Timers, synthetic events, an arbitrary Lua call, or a visible glyph cannot authorize a protected action. Apply each client's actual restrictions; do not infer that a Classic declaration lacking Retail secrecy metadata makes an action unrestricted. If a change cannot legally occur now, retain native behavior or a clear disabled state and apply only permitted setup later.

## Preserve text-field behavior

Choose native keyboard handoff, a verified external keyboard, or an addon-owned editor according to the product's requirements. A full multilingual keyboard is not required for every addon. Keep navigation capture from consuming ordinary typing and use the same ownership-checked change/submit handlers as the field's existing mouse/keyboard path. Preserve autosave versus explicit submission; do not invent Enter events for each inserted character. Back cancels pending composition first and does not silently undo text already autosaved.

When implementing an editor, bind its session to the semantic owner/field and current text revision. A temporarily hidden keyboard can retain that session and draft during takeover; clear held/repeat state, then revalidate ownership and source text before resuming after neutral. Discard stale composition if the field was recycled, its record replaced, or another editor changed the text. Never commit into a different character/profile/record.

For supported Unicode input, edit by grapheme boundaries and preserve untouched text bytes. Test combining marks, selection/deletion and composition, including each promised language/layout and persistence through reload. Keep literal fields such as share codes case-sensitive without automatic normalization. Bound undo/history storage. Distinguish addon-internal copy/paste from external clipboard handoff through the platform's existing interface; do not promise clipboard access the client does not expose.

## Keep inactive work bounded

Use events where verified and a measured fallback poll only for state that can otherwise arrive late or be missed. Sample mode, release recovery and competing ownership before reconciling once per update interval. Skip expensive graph rebuilds, repeated binding installation and glyph/layout work when the owner is closed or the relevant state is unchanged. Do not scan every UI frame each tick to find a blocker; use the known owner and guarded adapters. Choose cadence from the selected client's behavior, not a copied constant.

Stop repeat timers and release transient graphs, editor buffers or decoded candidate caches when their lifecycle ends; retain only bounded restoration state that is needed. Measure closed, open and active-editing workloads separately with matching data and collection conditions. Host timing and simulator memory estimates are useful regression evidence, not actual-client CPU/RAM results or proof that retained saved history is a leak.

## Validate for every selected client

Record client/build, source commit, chosen adapter, test method and result separately. Reuse the [client validation checklist](../../wow-addon-development/references/CLIENT-VALIDATION.md). At minimum cover:

- No controller, disabled controller support, disconnect/reconnect, and mouse/keyboard switching while the window is open. Existing controls and user settings remain usable.
- Acquisition while unfocused, open/close/reopen, load-on-demand and competing windows; correct initial/return focus; no invisible owner retaining bindings. Check actual callback delivery and capture readbacks.
- Directional reachability, disabled controls, grid/list boundaries, tab/page changes, filtering, inactive mouse scrolling, free scrolling past focus, recycled frames, same-ID record replacement, stale callbacks, asynchronous redraws, and empty/loading results.
- Primary/back/secondary actions, held/repeated input and paired down/up transitions through registered native scripts; no double actions, orphan-release activation, accidental gameplay input or blocked unrelated bindings. Include screenshot/chat handoff and reconnect before release.
- Current-binding hints after remapping, both binding slots, chords, conflicts, explicit unbinding and device/label-style changes; text fallback for unavailable glyphs; visible focus and readable prompts at chosen UI scales/locales.
- Nested popups and edit boxes; autosave/submission, cancellation and suspended composition; restored focus; no swallowed typing or inaccessible pointer-only action. Exercise the languages and device families promised by this product.
- Out-of-combat and combat entry/exit, including an already-open window; native protected behavior, Lua errors and taint/blocked-action observations.
- Shared widgets and native/reskinned windows with ordinary mouse/keyboard interactions, hover/focus tooltips, and only the addon enabled where applicable.

For host regressions, enter through production callbacks and load the complete production TOC with explicit fixtures/prerequisites. Use fresh VMs to diagnose cross-test state leaks, while retaining the sequential integration lane. Keep cold/asynchronous work-budget tests outside helpers that automatically drain all queued work. A simplified host that omits the acquisition adapter can pass navigation tests while the real window remains unreachable.

Run only tests supported by the chosen host/client workflow. A screenshot proves appearance, a simulator can exercise its implemented model, and static source checks establish contracts; none alone proves physical-controller or in-game secure behavior. Mark missing access, unavailable hardware, unsupported target features and stale/network-unverified evidence explicitly.
