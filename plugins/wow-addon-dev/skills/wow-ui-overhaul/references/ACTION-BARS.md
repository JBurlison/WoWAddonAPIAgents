# Action bars, paging, procs, and compact keybinds

Action bars are protected combat surfaces. Never recreate or resize secure action buttons during `InCombatLockdown()`, and never silently overwrite the user's saved keybindings.

## Secure action buttons and state paging

Inspect Blizzard's pinned bar and state driver implementations before choosing between reskinning `Blizzard_ActionBar` or building custom bars (`Interface/AddOns/Blizzard_ActionBar/Shared/ActionBar.lua`, `ActionButton.lua`, `MainActionBar.lua`, and `Interface/AddOns/Blizzard_RestrictedAddOnEnvironment/SecureStateDriver.lua` across Retail `ab5cb850`, Forever `734f0653`, and Classic `e171ae99`):

- **Custom secure bar buttons:** Inherit `SecureActionButtonTemplate` (and `ActionBarButtonEventsFrame` / explicit action attributes outside combat: `type="action"`, `action=<slot>`), or use `RegisterStateDriver` on a parent `SecureHandlerStateTemplate` header to dynamically remap `actionpage` across `[overridebar]`, `[possessbar]`, `[vehicleui]`, `[bonusbar:1]`, `[stance:...]`, and `[bar:2..6]`.
- **Reskinning Blizzard bars:** When styling existing `ActionButton1..12` or `MultiBar*` buttons in place, attach an addon-owned backdrop/border frame behind the icon and style `Icon` texcoords (`0.08, 0.92, 0.08, 0.92`), `NormalTexture`, `Cooldown`, `Count`, and `HotKey` without replacing `OnClick`, `OnDragStart`, `OnReceiveDrag`, or `SecureActionButton` attributes.
- **Secondary / utility bars:** Keep extra potion, mount, or utility bars as separate opt-in modules using item/spell/macro attributes (`type="item"`, `type="spell"`) configured outside combat.

## Range tinting, usability, cooldowns, and proc glows

- **Range & usability:** Query `C_ActionBar.IsActionInRange(actionID)` / `IsActionInRange` and `C_ActionBar.IsUsableAction(actionID)` via `query.mjs` for your target build. On Retail and Forever, check `SecretArguments` / nilable return contracts (`canaccessvalue` if needed; never perform arithmetic or comparisons on secret returns). Tint only the icon (`SetVertexColor`), keeping disabled/OOM distinct from out-of-range red.
- **Cooldowns:** Use `cooldown:SetCooldownFromDurationObject(...)` where `LuaDurationObject` is returned (Retail/Forever), or `SetCooldown(start, duration)` where plain numbers are returned; guard zero/unknown durations.
- **Spell proc glows:** Create an addon-owned `Frame` + `AnimationGroup` (gold pulse/border shimmer) keyed to the button in a weak-keyed table (`__mode = "k"`), triggered via `SPELL_ACTIVATION_OVERLAY_GLOW_SHOW` / `HIDE`. Never mutate Blizzard's shared `ActionButtonSpellAlertManager` / `SpellActivationAlert` pools.

## Compact keybinds and binding safety

- Shorten displayed binding text on the button's `HotKey` `FontString` without altering the underlying binding: e.g., `SHIFT-` -> `S`, `CTRL-` -> `C`, `ALT-` -> `A`, `MOUSEWHEELUP` -> `WU`, `BUTTON` -> `M`, `NUMPAD` -> `N`.
- Preserve native hover tooltips, drag-and-drop spell placement, flyouts, and controller action-bar navigation; never call `SetBindingClick` or `SetOverrideBindingClick` silently without an explicit user action/option, and always wrap binding edits with `not InCombatLockdown()`.
