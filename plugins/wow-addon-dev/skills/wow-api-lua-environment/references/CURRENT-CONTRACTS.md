# Taint and restricted-value contracts reviewed 2026-10-31

Use this reference before historical security examples. It records specific source contracts; it does not certify every historical statement about combat lockdown, secret values or client restrictions.

| Target / build | Value-access definitions | Protected-operation definitions |
|---|---|---|
| Retail 12.1.5.70688 | [d07eb002: FrameScript](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/FrameScriptDocumentation.lua) | [RestrictedActions](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_APIDocumentationGenerated/RestrictedActionsDocumentation.lua) |
| Forever 1.60.1.70532 | [ca8368f2: FrameScript](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/FrameScriptDocumentation.lua) | [RestrictedActions](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/RestrictedActionsDocumentation.lua) |
| Classic progression 5.5.4.70631 | [e5d9b3a2: FrameScript](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/FrameScriptDocumentation.lua) | [RestrictedActions](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_APIDocumentationGenerated/RestrictedActionsDocumentation.lua) |

These declarations have `Environment = "All"`. Engine declarations do not need a guessed Blizzard UI dependency; loaded UI helpers/templates have separate loading requirements. Availability and caller permission still need validation in the selected client/context.

## Separate the three questions

1. **Taint:** is the variable or execution path secure? A secure variable is not a promise that its value is non-secret.
2. **Data access:** can the immediate calling function inspect this particular value/table? A value that can be passed to a widget is not necessarily readable or comparable by addon Lua.
3. **Protected operation:** is this calling context allowed to operate on the particular frame/object? Being out of combat or having a non-secret argument alone is not a complete permission test.

### issecurevariable boolean correction

The historical signature is `isSecure, taintSource = issecurevariable([table,] name)`: **true means secure; false means tainted**. The old example inverted that boolean and used the misleading name `isTainted`; both are corrected. This diagnostic is observational: checking a variable does not remove taint or grant permission to execute protected code.

```lua
-- Historical diagnostic contract; verify availability in the selected client.
local isSecure, taintSource = issecurevariable(someTable, "someKey")
-- isSecure == true: secure; isSecure == false: tainted.
-- taintSource identifies the taint source when available.
```

Evidence limit: none of the three inspected generated inventories declares `issecurevariable`, and no caller was found in those pinned UI trees. This corrects an internal contradiction in the retained historical material; it is **not a newly source-verified per-client signature**. Before using it for a current diagnostic, confirm its callable presence and return convention in that client, using an addon-owned field with known write provenance. Do not report the missing declaration as removal or certify it merely because another secret-access API is present.

## Source-verified value-access predicates

The signatures below match the three pinned FrameScript definitions. The result concerns the immediate caller; moving a check into a differently tainted helper can change the relevant context.

| Function | Ordered arguments | Return / scope |
|---|---|---|
| `canaccessvalue` | `value: LuaValueReference` | `canAccessValue: bool`; permission to operate on this value. |
| `canaccessallvalues` | `values: LuaValueReference...` | `canAccessAllValues: bool`; permission for all supplied values. |
| `canaccesstable` | `table: LuaValueReference` | `canAccessTable: bool`; permission to index the table and its contents in the caller's context. |
| `canaccesssecrets` | none | `canAccessSecrets: bool`; caller's general permission for secret values. |
| `issecretvalue` | `value: LuaValueReference` | `isSecret: bool`; whether the supplied value is secret, not permission to inspect it. |

All five have `SecureHooksAllowed = false`. Retail/Forever put `SecretArguments = "AllowedWhenUntainted"` on the four that accept arguments; `canaccesssecrets` has no argument annotation. Classic omits those argument annotations. Preserve those distinctions: these predicates are not a generic bypass, and an unannotated Classic declaration does not establish unrestricted behavior.

### Protected operations

`C_RestrictedActions.CheckAllowProtectedFunctions(object: FrameScriptObject, silent: bool=false) -> protectedFunctionsAllowed: bool` asks about the current context for that object. It has `SecureHooksAllowed = false` in all three definitions and `SecretArguments = "AllowedWhenUntainted"` in Retail/Forever. `silent=true` suppresses blocked-action errors from the check; it does not permit a denied action. `InCombatLockdown() -> inCombatLockdown: bool` is declared as a global, not a `C_RestrictedActions` method.

`C_RestrictedActions.GetAddOnRestrictionState(type: AddOnRestrictionType) -> state: AddOnRestrictionState` and `C_RestrictedActions.IsAddOnRestrictionActive(type: AddOnRestrictionType) -> active: bool` are distinct queries. Retail/Forever annotate their arguments `AllowedWhenUntainted`; Classic omits that annotation. `ADDON_RESTRICTION_STATE_CHANGED(type: AddOnRestrictionType, state: AddOnRestrictionState)` is synchronous and fires before activation or after deactivation. The source specifies that `IsAddOnRestrictionActive` returns false during this event's dispatch; use the supplied state according to its declared enum rather than using that transient false as a lasting permission claim.

## Applying annotations to combat code

- Preserve annotations at their actual scope: `SecretArguments` governs inputs, `SecretReturns`/`SecretWhen...` governs results, and `ConditionalSecret`, `ConditionalSecretContents` or `NeverSecret` describes specific fields/containers. Do not turn one into a blanket statement about every result from a namespace.
- Retail/Forever [meter contracts](../../wow-api-combat/references/CURRENT-CONTRACTS.md) annotate four session queries `SecretWhenInCombat`; only selected fields are `NeverSecret`. A plain name, class or boolean elsewhere does not make totals/GUIDs readable.
- [Cooldown duration objects](../../wow-api-spells-abilities/references/CURRENT-CONTRACTS.md) are objects, not seconds. A supported display consumer can still have protected-operation/secret-argument constraints; verify both sides of the call.
- In Forever, [aura definitions](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitAuraDocumentation.lua#L208) mark `GetAuraDataByIndex` with unit-aura access and secret-return conditions; `GetUnitAuras` also marks its returned table with `ConditionalSecretContents`. Do not assume a returned table can be freely indexed or cached.
- In Forever, [UnitHealth](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/UnitDocumentation.lua#L1526) has `SecretReturns = true` and a restricted unit-token type. Do not replace those precise annotations with an unverified rule that health is plain outside a particular area.

Do not use `pcall`, serialization, string conversion, wrapper tables, global rewrites or compatibility shims to claim secret values became readable. An error guard can contain a registration failure; it does not change the underlying permission. Do not clear/reset a widget to try to recover restricted data that was previously supplied to it.

## Runtime verification remains open

Record build, caller context, frame ownership/protection, enabled addons, and out-of-combat/combat/instance scenarios for the operation the addon needs. Verify error-free permitted presentation and graceful omission of an unavailable capability. This review performed no game-client tests and does not certify all historical security guidance.
