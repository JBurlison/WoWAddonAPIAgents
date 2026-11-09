# Radial menus: native flow, secure actions and faithful tests

Use for controller wheels, nested party/raid selection and radial skins. Resolve the requested client first. This study is **Forever 1.60.1.70862**, source `9dc84f0d3bbae1768ac3405b3716000bd93eda06`, reviewed 2026-11-09; it does not establish equivalent Retail/Classic behavior.

## Trace the actual native implementation

| Question | Pinned native evidence | What it establishes |
|---|---|---|
| How does the game-menu radial select? | [GamepadRadial.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_Gamepad/UI/Radials/GamepadRadial.lua), `ProcessInput`, `BeginSelection`, `CancelSelection` | `distanceSq > 0.25` begins/updates selection; `distanceSq < 0.04` commits an existing selection. Cancel waits for center before rearming. Selection is return-to-center, not a mandatory face-button press. |
| How does the native spell flyout cast? | [FlyoutRadial.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_GamepadActionBars/FlyoutRadial.lua), `OnLoad`/`UpdateSelection`; [SpellFlyout.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_ActionBar/Shared/SpellFlyout.lua), `OnClick` | Native axis binding invokes the selected button's `Click()` below its threshold, then the native handler calls CastSpellByID/Name. Trace [SpellFlyoutRadial.xml](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_GamepadActionBars/SpellFlyoutRadial.xml) and the [camelot TOC](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_GamepadActionBars/Blizzard_GamepadActionBars.toc) for loading. This is native implementation evidence, not addon casting permission. |
| What is `TriggerSecureClick`? | [ActionBarButton.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_GamepadActionBars/ActionBarButton.lua), `GamepadActionBarStandardButtonMixin:TriggerSecureClick` | A native mixin forwarding to SecureActionButton_OnClick with native flags. It is not a documented addon API that grants secure execution to arbitrary callbacks. Do not copy the `isSecureAction=true` flag as a workaround. |
| How is the stick identified and captured? | [InputAxisBinding.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_GamepadSharedUtility/InputBindingStack/InputAxisBinding.lua) | Callback uses `Movement`/`Camera`, returns whether input is unhandled, and gates a new owner until center. `StickIndexToConfigName(i-1)` maps a zero-based config index to a one-based state entry. |
| Can an addon secure-wrap stick release? | [SecureHandlers.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_RestrictedAddOnEnvironment/SecureHandlers.lua), `LOCAL_Wrap_Handlers` | Reviewed wrapper map supports click, mouse, show/hide, drag and attribute paths, not OnGamepadStick or raw gamepad button scripts. Native privileged callbacks cannot be assumed reproducible in addon combat code. A different route needs separate evidence and an actual-client test. |

For a nested release-to-select design, specify one outward gesture and one return per tier. Centering at open must do nothing; a held direction must not carry into the next tier. Use separate arm/commit thresholds to avoid drift. Cancel, lost device, mode handoff and roster invalidation clear the armed selection; reacquisition waits for neutral. Preserve the user's chosen interaction instead of silently substituting A-confirm. If the requested protected path is not established, explain the precise gap and obtain a fallback choice; continue independent display/configuration work.

## Restricted arguments: frame references, not handle varargs

[RestrictedExecution.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_RestrictedAddOnEnvironment/RestrictedExecution.lua), `BuildRestrictedClosure`, invokes `def(SelfScrub(self), scrub(...))`. Only the special `self` slot preserves its frame handle. Passing a handle as an ordinary `RunAttribute` argument produces nil in the receiving snippet. [RestrictedFrames.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_RestrictedAddOnEnvironment/RestrictedFrames.lua) defines RunAttribute and GetFrameRef.

Configure a reference outside combat, pass a primitive reference key, then resolve it inside the restricted snippet. For example, with an already valid protected hub and action button:

```lua
hub:SetFrameRef("action", button)
hub:SetAttribute("op-dispatch", [[
    local ref, button, down = ...
    local clicked = self:GetFrameRef(ref)
    -- Validate the input/tier here; configure the genuine native action.
]])
SecureHandlerWrapScript(button, "OnClick", hub,
    'return control:RunAttribute("op-dispatch", "action", button, down)')
```

This illustrates reference transport only, not a complete casting implementation. Keep snippet names distinct from state attributes (`op-stage` versus `stage`). A real Forever error on 2026-11-09 reproduced nil `clicked` on both Toggle down and up; a simulator and unsanitized Lua fixture had accepted the faulty call.

## Skin the wheel separately from a dialog shell

[GamepadRadial.xml](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_Gamepad/UI/Radials/GamepadRadial.xml) provides native radial composition:

- `gamepad-radial-menu-wheelbg`, `gamepad-radial-menu-selected`, `gamepad-radial-menu-disabled`;
- `gamepad-radialgamemenu-cursorbg-neutral` / `-inactive` for page indicators;
- native spell/class icons, native fonts and device input atlases layered separately.

For a wheel-only request, omit the rectangular shell, opaque backdrop, close box, configuration buttons and permanent header/footer rows. Keep navigation/status inside the wheel; put configuration in native addon Settings. A native canvas subcategory can host a spell/macro editor, separate from the gameplay overlay. Check the selected Settings contract before registration.

Match wedge artwork to actual sector count and hit geometry. A fixed eight-sector atlas cannot be treated as a nine-sector layout without reviewing alignment. Where variable counts need custom geometry, preserve the agreed native appearance and use native text/icons/hit regions; do not claim exact native artwork. Review largest font, longest localized labels and tiny group indicators against the real game backdrop. Decorative art should not capture the full rectangular mouse area or become focus stops.

For healing status, include self through the same unit path. Show member HP and selected-recipient HP on the spell tier. [AuraUtil.lua](https://github.com/Gethe/wow-ui-source/blob/9dc84f0d3bbae1768ac3405b3716000bd93eda06/Interface/AddOns/Blizzard_FrameXMLUtil/AuraUtil.lua) defines `HARMFUL|RAID` as harmful auras the player can dispel; `RAID_PLAYER_DISPELLABLE` instead includes what someone in the raid can dispel. Choose the intended meaning explicitly. Use native filtered aura data rather than guessing dispels from a class list. Native `ui-debuff-border-<type>-noicon` atlases identify type. Bound icon rows need overflow indication. Restricted/unknown values are not zero HP or proof of no debuffs. Health/aura presentation must not automatically choose a recipient/action.

## Simulate the contract that can actually fail

Keep three distinct layers: Lua contract model, rendered simulator interaction and physical client security/input acceptance.

1. Model the registered script signatures and argument scrubbing, not just helper functions. Preserve `self`, strip ordinary handle/table/function arguments and retain nil positions/false. A fixture that passes Lua frame tables unchanged through RunAttribute hides a real failure.
2. Exercise actual down/up registration and dispatch, including orphan up, held input, fresh confirmation per tier and modifier combinations. For release-to-center, exercise outward → rotate → partial return → center, neutral at startup, cancellation and rearming; do not call a synthetic Click from production stick polling just to satisfy the fixture.
3. In the browser simulator, observe state after each tier before clicking the next geometry. Canvas layout updates can lag the previous input; a rapid coordinate batch can hit the old tier. Verify selected member, native action recipient, current target and final open/closed state.
4. If a binding produces only down, use a disposable independent AnyDown/AnyUp probe to distinguish a simulator delivery gap from addon logic. Restore bindings and reload after probing. Do not weaken production release pairing to fit a simulator.
5. Check Errors and Missing APIs with the addon isolated, then restore the original enabled addons/scenario/scale/font. Attribute diagnostics introduced by other addons separately. Record simulator build and source pin independently; a simulator pass is not a taint/combat/hardware pass.

The observed UIForever 1.60.1.70450 check accepted native mouse tier actions but an independent binding probe delivered down only. This is a dated observation to recheck, not a permanent simulator limitation. Save actual implementation screenshots separately from design mock-ups.
