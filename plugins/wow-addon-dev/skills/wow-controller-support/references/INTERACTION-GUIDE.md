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

Activate handlers/bindings only while their owner is eligible, shown, focused and in the appropriate mode. Release them on hide, disable, modal takeover, mode change or disconnect. Handle opening before and after native owners load, including already-loaded owners and late-created controls. Keep setup idempotent; avoid duplicate hooks/listeners. Track ownership of callbacks and overrides so cleanup removes only this addon's registrations.

Define one current focus and directional neighbors among eligible controls. Skip hidden, disabled and decorative controls. Keep focused content scrolled into view. Give menus/popups priority within their own scope; Back cancels the innermost interaction before closing its parent, restoring a valid previous focus. Re-evaluate focus after a tab change, sort, resize, filter, row release or data refresh. Never retain a pooled frame as a permanent item identity or leave its old callbacks/tooltip/action attached after recycling.

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

## Validate for every selected client

Record client/build, source commit, chosen adapter, test method and result separately. Reuse the [client validation checklist](../../wow-addon-development/references/CLIENT-VALIDATION.md). At minimum cover:

- No controller, disabled controller support, disconnect/reconnect, and mouse/keyboard switching while the window is open. Existing controls and user settings remain usable.
- Open, close, reopen, load-on-demand and competing windows; correct initial/return focus; no invisible owner retaining bindings.
- Directional reachability, disabled controls, grid/list boundaries, tab/page changes, filtering, scrolling, recycled rows, and empty/loading results.
- Primary/back/secondary actions, held/repeated input and down/up transitions; no double actions, accidental gameplay input or blocked unrelated bindings.
- Current-binding hints after remapping and device/label-style changes; text fallback for unavailable glyphs; visible focus at chosen UI scale.
- Nested popups and edit boxes; cancel/confirm behavior; restored focus; no swallowed typing or inaccessible pointer-only action.
- Out-of-combat and combat entry/exit, including an already-open window; native protected behavior, Lua errors and taint/blocked-action observations.
- Native/reskinned windows with ordinary mouse/keyboard interactions, hover/focus tooltips, and only the addon enabled where applicable.

Run only tests supported by the chosen host/client workflow. A screenshot proves appearance, a simulator can exercise its implemented model, and static source checks establish contracts; none alone proves physical-controller or in-game secure behavior. Mark missing access, unavailable hardware, unsupported target features and stale/network-unverified evidence explicitly.
