# Standalone skin architecture

This is an implementation pattern, not a promise that one set of frame paths works on every client. Resolve actual hooks, members, addon names and restrictions from the [window recipes](NATIVE-WINDOW-RECIPES.md) and current pinned sources before implementation.

## Separate the decisions

| Layer | Owns | Does not own |
|---|---|---|
| Theme | Named colors, typography, border widths, spacing, corner treatment and assets supplied by this addon | Client frame discovery or gameplay state |
| Client adapter | Source-verified addon owner, root/child lookup, initialization/update binding and capability differences | A universal list of guessed globals |
| Window module | Character, spellbook or another explicitly enabled surface; decoration and state mapping | Unrelated Blizzard UI |
| Shared styling helpers | Small original routines for this addon's buttons, icons, panels, tabs and labels | ElvUI prototype extensions or replacement game logic |

For multiple clients, ship the matching adapter in each target's distributable. Do not import ElvUI's client flags or identify Forever from one frame's existence. The source can contain files for several game types at once.

## Load and initialize deliberately

1. Determine whether the owning Blizzard addon is already loaded, loads later, or creates the requested frame only after a user action. An `ADDON_LOADED` notification does not guarantee every lazily created child exists.
2. Register the verified owner-load callback/event and also handle the already-loaded case. Reuse the target's verified addon-load helper when suitable; otherwise use the documented addon/event contracts. Avoid timers that poll every frame for a global.
3. Resolve the window when its owning code makes it available. Defer to its specific creation/show/update callback for late children. Do not force-load unrelated Blizzard addons merely to skin them during login.
4. Attach each hook once and retain addon-local bookkeeping by object identity. Avoid writing generic flags such as `isSkinned` onto Blizzard-owned frames: they can collide with other addons or taint fields later read by secure code.
5. Keep initialization callable again. If required children are missing, report/defer the module and retry at the relevant verified lifecycle point. Do not mark incomplete setup as successful.

Use three conceptual operations:

```text
Attach(frame): create this addon's decoration once; bind permitted refresh hooks once.
Refresh(frame, current binding): repaint visible state from the current verified data.
Disable(frame): stop this addon's updates; hide its decoration; restore only safe owned edits.
```

A theme revision can invalidate colors/fonts while the frame's hook registration remains valid. Do not use one boolean to skip both setup and every later state update. Store design state separately from item or spell identity.

## Follow Blizzard's update ownership

First identify the method that sets the property being customized. Prefer its narrow post-update hook or documented callback. Run the initial refresh too: the underlying update may have occurred before the hook was installed. Do not hook `SetPoint`, `SetTexture`, `Show` or `SetAlpha` globally when a window-specific visual update is available.

Hooking a setter and calling that same setter inside the callback can recurse. Reanchoring after every layout pass can also cause layout feedback and jitter. Prefer a stable layout point, compare only values that are safe to inspect, and use a reentrancy guard where necessary. Do not suppress or replace native refresh logic to keep a color from reverting.

Preserve script chains: an existing `OnClick` may own spell actions, while `OnEnter`/`OnLeave` own tooltips, comparison panes or input hints. Do not use `SetScript` to replace them with cosmetic behavior. Choose a compatible documented script hook or secure post-hook only after checking the actual object and method. A post-hook observes after execution; it cannot change the original function's return contract and does not authorize protected operations.

## Treat pooled objects as reusable views

Character stat rows, lists, tabs and spell displays may be pooled or rebound. A one-time pass over `GetChildren()` misses later frames; a one-time color assignment may leak the previous row's state.

- Locate the pool or view's actual acquisition, initialization, binding, update and release callbacks. Do not assume the same reset function for every widget or client.
- Install decoration/hooks once per object, then derive colors and indicators from its current binding on every relevant refresh. Avoid closures that permanently capture its first item ID, spell ID or list index.
- Handle current active objects as well as those created later. A post-hook of an acquisition method does not automatically receive its returned row: use a suitable callback, a later binding point, or the verified collection enumeration rather than guessing a hook signature.
- On release/rebinding, clear this addon's data references and transient decoration state. Never replace the native reset routine or hide its functional children. Do not retain a released frame as a queued combat update target without resolving its new binding afterward.

## Change ornament without deleting information

Build a per-surface region map: background, outer border/NineSlice, title, portrait/model, icons, masks, highlight, selection, cooldown, quality, availability, warning and focus indicator. Verify each member's purpose from its update path.

Use an addon-owned visual layer with appropriate strata/frame level and draw layers. It must not capture clicks, block scrolling, obscure tooltips or cover a focus/disabled/selection state. Reparenting a Blizzard frame can change clipping, scale, anchoring, protected relationships and inherited visibility; do not do it solely to simplify a border.

Keep masks and texture coordinates intentional. A square icon treatment may require an original crop and a changed mask relationship, but blindly removing masks can expose unwanted art or lose functional overlays. Preserve normal, pushed, highlight, checked and disabled button states. A visually flat button still needs understandable interaction states.

For deep layout changes, identify the owning layout system and the supported constraints before moving controls. Native panel managers, scroll containers, frame pools and Edit Mode can reapply positioning; do not fight them with an unconditional `OnUpdate` loop. If the requested layout cannot be achieved through verified hooks without breaking native actions, offer a smaller skin or an explicitly separate addon-owned view with its own functional scope.

## Combat, disabling and coexistence

Classify each requested mutation against the selected client's protected-frame and taint rules. Initial login outside combat does not guarantee later callbacks run outside combat. Defer restricted work and use a bounded dirty-module queue for the next permitted update. Queue intent, not restricted values or stale frame bindings. Styling cannot bypass protected action restrictions or secret-value handling.

Choose disable behavior before applying destructive changes. Addon-owned decoration is easy to hide; original textures, fonts and anchors require a recorded restoration strategy. Restoring a captured value after Blizzard has changed the underlying state can itself be wrong. If a reliable live restore is not available, document that disabling the module takes effect after `/reload` instead of claiming complete immediate reversal.

Do not promise to unregister a secure hook: make its callback no-op when the module is disabled and avoid reinstalling it. Preserve the original region's role even when the skin changes its presentation. Prefer compatible, observable modifications over disabling Blizzard scripts, unregistering its events or permanently hiding functional regions.

When another skin addon owns the same window, default to a module opt-out or a documented compatibility adapter. Do not detect a conflict and then aggressively restore your own visuals every frame. Test both a minimal-addon setup and any coexistence combination the user actually requires.
