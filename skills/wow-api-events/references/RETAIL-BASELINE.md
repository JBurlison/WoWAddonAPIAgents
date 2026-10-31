# Current event contracts and registration

This path is retained for existing links; its historical event summaries have been replaced with source-pinned guidance. The complete catalogues cover Retail 12.1.5.70688, Forever 1.60.1.70532 and Classic progression 5.5.4.70631. There are respectively 1,784, 1,814 and 1,483 generated Event declarations, including 12, 12 and 8 marked CallbackEvent. These totals are source inventories, not counts of events an addon may subscribe to.

## Read the full payload

Use the [query tool](../../wow-api-index/scripts/query.mjs) with the exact target and literal event name. Inspect ordered `Payload` fields, their `Type`/`Nilable`, nested structures, and all event/field security annotations. A missing Payload section means no payload fields are declared there; runtime behavior still needs verification. `SynchronousEvent` and `UniqueEvent` are source annotations, not an invitation to reorder or discard arguments.

| Contract | Pinned evidence and practical consequence |
|---|---|
| Forever SPELL_UPDATE_COOLDOWN | [SpellBook declaration](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SpellBookDocumentation.lua#L924): `spellID, baseSpellID, category, startRecoveryCategory, itemID`, all nilable numbers. A nil spellID requests a general cooldown refresh; preserve optional identifiers. |
| Forever UNIT_AURA | [UnitAura declaration](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitAuraDocumentation.lua#L644): `unitTarget: UnitTokenVariant, updateInfo: UnitAuraUpdateInfo`, both non-nilable in the declaration. `SecretWhenAurasRestricted` applies; inspect the structure without assuming every field is safe to compare. |
| Forever PLAYER_SWING | [SwingTimer declaration](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SwingTimerDocumentation.lua#L48): `swingDuration, swingType`, in that order. Use the current combat guide for loading and range-check behavior. |
| Cross-target payload drift | Query `all SPELL_UPDATE_COOLDOWN --kind event`; Classic declares four optional fields and the inspected Retail/Forever sources declare five. Never share a tuple based only on the event name. |

## Frame events and callbacks

[C_EventUtils](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/EventUtilsDocumentation.lua) declares `IsEventValid(eventName)` and `IsCallbackEvent(eventName)`, both returning a boolean. Check function presence on the selected client before using a probe. Validity is not permission or proof of delivery.

A `CallbackEvent` record is distinct from a frame event. Follow the actual dispatcher and registration API. Handwritten EventRegistry callbacks such as the Forever `Legacy.*` callbacks belong to their loaded UI modules; do not pass them to `Frame:RegisterEvent` merely because their names describe events.

## Isolate registration failures

After source/load/access review, a compatibility adapter can isolate registration failure without aborting the entire addon file:

```lua
local function TryRegisterFrameEvent(frame, eventName)
    if C_EventUtils and C_EventUtils.IsEventValid
        and not C_EventUtils.IsEventValid(eventName) then
        return false, "Event is not valid in this client"
    end
    if C_EventUtils and C_EventUtils.IsCallbackEvent
        and C_EventUtils.IsCallbackEvent(eventName) then
        return false, "Use the verified callback dispatcher"
    end
    return pcall(frame.RegisterEvent, frame, eventName)
end
```

Record the result per target and disable or adapt the affected optional feature when registration fails. `pcall` contains errors; it does not grant access, defeat restrictions, or prove a handler will receive events. Do not hide required feature failures or log restricted payloads.

## Runtime acceptance

For each required event, record the exact client build, active mode, owning UI addon/load conditions, registration outcome, triggering action and observed delivery. Test login/reload, combat and relevant instances where applicable. Observe only permitted payload metadata; never serialize secret values to discover their contents. A one-session event capture cannot prove all events or payload variants exist.
