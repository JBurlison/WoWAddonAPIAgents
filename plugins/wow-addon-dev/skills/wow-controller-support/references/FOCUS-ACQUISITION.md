# Focus acquisition and diagnostics

Use this guide when a window cannot receive its first controller action, when adding a native-style focus shortcut, or when input stops after a handoff. The concrete Forever example is pinned to build 70790 in the [source map](SOURCE-MAP.md#my-epoch-focus-case-study). Reverify contracts for the selected target; it is not a portable binding recipe.

## Separate the four decisions

| Decision | Question |
|---|---|
| Eligibility | Is the window shown, permitted to interact, and free of a higher-priority owner? |
| Acquisition | Which reachable action can request ownership while the window is still unfocused? |
| Capture | Which owner consumes subsequent button/stick input, and how does it release it? |
| Semantic focus | Which current control will navigation or activation operate on? |

Prove a minimal path through these decisions before building a large navigation graph. A catcher activated only after ownership cannot receive the press needed to acquire ownership. Choose a verified native integration, an explicit addon focus binding, or a narrow temporary acquisition bridge. Broad navigation capture starts only after ownership; acquisition must remain reachable in its intended inactive state. Opening/toggling a window and reclaiming its input are distinct actions; expose separate unassigned bindings if the product needs both.

An explicit focus request may reclaim an ordinary window according to the addon's policy, without writing native focus-manager state. Track the native owner at acquisition: a preexisting window behind the addon need not be the same veto as a newly focused window. Modal dialogs, external editing, competing controller overlays and combat restrictions still take priority. A mouse-clicked focus request must survive an unchanged sample saying the last input was mouse; a fresh mouse interaction can yield ownership.

## Resolve the action behind the hint

Forever 70790's Game Menu uses `FrameFocusJumpHintTemplate`, a passive `GAMEPAD_MENU_LEFT` hint. Adding that template or drawing its View/touchpad/Minus glyph does not register an addon window for focus. The native action is `TOGGLEUIFOCUS` in `GamepadModeInGameCore`. Native manager methods implementing it are not a general addon focus API.

For that pinned client, the native keybinding UI reads the action's context with `C_KeyBindings.GetBindingContextForAction(action)`, then calls `GetBindingKey(action, nil, context)`. Verify those contracts and loading before using the pattern. Resolve both slots and complete modifier chords; refresh on verified binding changes. Check the effective action/conflicts where supported. Do not assume the artwork's default `PADBACK` is still bound to focus.

Distinguish **successful lookup with no keys** from a missing or failed lookup. The former is explicitly unbound: do not silently arm `PADBACK`. A compatibility fallback needs evidence that the candidate key actually resolves to the intended action. Render hints from the resolved binding and device style, with a text fallback; glyph resolution does not resolve action ownership.

## Bound the acquisition bridge

If a verified addon-owned path uses temporary overrides:

- Arm only the resolved acquisition key(s), only while eligible. Do not globally poll a key to trigger focus while allowing the native action to fire too. A background release check may cancel a lost press; it must not synthesize an action.
- Use an isolated binding owner, clean up partial installation, and remove only this owner's overrides. Hiding a click target is not binding cleanup. Handle close, disable, remap/unbind, screenshot capture, native-chat handoff, competing ownership and device loss.
- Keep ordinary click dispatch separate from restricted binding setup. My Epoch used a secure binding owner independent of its movable book and ordinary click targets receiving both edges. Parenting/anchoring secure objects into a movable UI can propagate restrictions; audit that relationship explicitly.
- Configure protected operations outside combat and defer prohibited mutations. In the inspected implementation, secure state-driver cleanup occurs on an update, so ordinary dispatch must reject disallowed actions immediately rather than trusting cleanup has already run. Secure `CallMethod` does not elevate ordinary addon code into a protected-action path.
- Never rearm unconditionally from a secure state transition. Recheck window eligibility, current bindings, blockers and neutral input through the permitted path. If capture cannot safely continue, suspend with a useful status and preserve the view/draft.

These are lifecycle constraints, not instructions to use secure snippets for every UI. Inspect the exact owner's APIs and restrictions before selecting an implementation.

## Preserve press identity until release

For release-driven acquisition or Back, record the down-time key/binding and current owner, modal scope, editor session and render token as relevant. Act once on its valid paired release. Repeated downs, orphan ups, and releases after remapping or replacing the context must not activate a new target. Raw gamepad and binding-click routes should share a latch if both can deliver the same press.

Opening while the acquisition key is held must wait for its release; acquiring focus must not also activate the selected control. Cancel repeats and stale pressed state during handoff. Resume only after buttons and sticks return to neutral, applying the selected dead zone. A missing release can cancel a press but cannot confirm it. Test closing while Back is held and reopening before release.

## Test the client callback boundary

Invoke the registered scripts in host tests with source-verified callback tokens and return semantics. Testing only an internal `MoveLeft()` function can reproduce an incorrect adapter assumption. In the pinned Forever example, stick callbacks use `Movement` and `Camera`; the native axis listener treats `false` as handled. Do not substitute guessed `Left`/`Right` tokens or infer gamepad propagation from keyboard APIs.

Inspect registration side effects: installing gamepad scripts can enable input in the audited path. Disable/hide an inactive catcher immediately where permitted. A successful protected-method `pcall` is not proof of capture; check enabled-state readbacks and actual callback delivery. Distinguish subsystem enablement, connected device, last active device and current input mode. `GAME_PAD_ACTIVE_CHANGED(false)` alone does not establish a disconnect.

For optional addon compatibility, audit a specific version's ownership signals and read them defensively. An on-screen keyboard may own input while editing this addon's own EditBox; checking only external edit boxes misses that case. Conversely, a visible overlay may already have yielded input. Do not hide other addons, mutate their private flags, or treat their internal fields as a stable universal contract. Keep the adapter optional and retain drafts while suspended.

## Diagnose before guessing

A diagnostic action should always produce a bounded result, including when capture APIs are unavailable. Record:

1. Loaded addon version, client/build, command registration and initialization status. A silent command may belong to an older installed build; it does not demonstrate interception by another addon.
2. Device presence, subsystem enablement and input mode separately.
3. Window eligibility, explicit focus intent, current native/addon blocker and last transition reason.
4. Resolved action/context/keys, acquisition arming state, capture readbacks and last setup failure.
5. Raw down/up/stick callback counters and recent tokens, held/neutral state, and eligible semantic-target count.

Keep the state immediately before opening chat as well as the current state: entering a diagnostic slash command can itself hand input to chat. Bound logs, avoid per-frame spam and exclude user text. When delivery works but no control moves, inspect semantic focus and generation validity next.

## Small runtime probe, then broader coverage

On each selected client with available hardware, first test acquisition from an unfocused window, exactly one action per paired release, and absence of unintended gameplay/native actions. Include a native window already open, a new modal/keyboard overlay, held-input handoff, combat entry before the next update, and return after neutral. Then expand to the [interaction checklist](INTERACTION-GUIDE.md#validate-for-every-selected-client).

Record physical device family, actual binding, loaded revision and result. A rendered glyph proves presentation; a host callback test proves its fixture; neither proves native input consumption. My Epoch's user-confirmed basic focus correction did not certify its later shortcut, every controller family, combat safety or coexistence. Keep those evidence boundaries when reusing the case study.
