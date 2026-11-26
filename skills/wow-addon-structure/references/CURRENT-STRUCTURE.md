# AddOn structure, C_AddOns, and lifecycle contracts

Verified against the bundled [target snapshots](../../wow-client-targets/references/targets.json) (`Retail 12.1.5.70961`, `Forever 1.60.1.71037`, `Classic progression 5.5.4.71060`). Complete per-target schemas remain queryable through [wow-api-index](../../wow-api-index/SKILL.md). Source declarations do not certify third-party loading or runtime permissions without per-client testing.

## Multi-version TOC layout and metadata

For multi-client releases targeting Retail, Forever, and Classic progression, prefer **shared core Lua/XML + separate verified per-client adapters + one clean `<Addon>.toc` per target build** rather than assuming unverified conditional directives or comma-delimited `Interface` lists behave identically everywhere. Keep addon folder name and `.toc` basename identical, keep `SavedVariables` schemas consistent across clients, and keep `Locales/` catalog files identical in every distributable.

| TOC directive / convention | Contract & verified behavior |
|---|---|
| `## Interface: <id>` | Derive from each target's pinned client version (`120105` / `16001` / `50504` — always confirm current client `GetBuildInfo()` fourth return before releasing). |
| `## Title:` / `## Title-deDE:` / `## Notes-frFR:` | Localized `Title-<locale>` and `Notes-<locale>` override the base AddOn list strings matching `GetLocale()`. |
| `## Group: <ParentAddOnName>` | Per Blizzard's `AddonList.lua`, `Group` must **exact-match** the parent addon's folder/TOC name (otherwise child addons are not nested properly under the parent). |
| `## AddonCompartmentFunc: <GlobalFuncName>` | Per Blizzard's `AddonCompartment.lua` (present in Retail and Forever `Blizzard_Minimap`, absent in Classic progression's `Blizzard_Minimap`), Minimap compartment click invokes `_G[funcName](addonName, menuInputData.buttonName)` — it **must be a global function name in `_G`**, not an addon-private local or `ns` method. Optional `AddonCompartmentFuncOnEnter` / `AddonCompartmentFuncOnLeave` follow the same `_G` lookup rule. |
| `## X-Curse-Project-ID: <id>` | Custom `X-` metadata consumed by CurseForge packager tools and readable via `C_AddOns.GetAddOnMetadata(name, "X-Curse-Project-ID")`. Do not copy Blizzard-internal directives (`AllowLoad`, `UseSecureEnvironment`, `SavedVariablesMachine`, `LoadFirst`, `EscalateErrorDuringLoad`) into third-party TOCs. |

## `C_AddOns` pinned contracts

Every `C_AddOns` function below is declared across **Retail, Forever, and Classic progression** (31 functions total). Retail and Forever annotate `uiAddon` / string arguments with `SecretArguments=AllowedWhenUntainted`. Note common historical misconceptions corrected below:

| Function | Exact verified signature | Historical pitfall avoided |
|---|---|---|
| `C_AddOns.GetAddOnInfo(name)` | `(name: uiAddon) -> name: cstring, title: cstring, notes: cstring, loadable: bool, reason: cstring, security: cstring` | Returns **6 values** starting with `name` (not 5 starting with `title`). |
| `C_AddOns.GetAddOnDependencies(name)` | `(name: uiAddon) -> deps...: cstring` (`StrideIndex=1`) | Returns multiple string values (`local d1, d2 = ...` or `{ ... }`), not a single Lua table. |
| `C_AddOns.GetAddOnOptionalDependencies(name)` | `(name: uiAddon) -> deps...: cstring` (`StrideIndex=1`) | Returns multiple string values, not a Lua table. |
| `C_AddOns.IsAddOnLoaded(name)` | `(name: uiAddon) -> loadedOrLoading: bool, loaded: bool` | Returns **2 booleans** (`loadedOrLoading`, `loaded`), not just one. |
| `C_AddOns.IsAddOnLoadable(name, character?, demandLoaded?)` | `(name, character="0", demandLoaded=false) -> loadable: bool, reason: cstring` | — |
| `C_AddOns.LoadAddOn(name)` | `(name: uiAddon) -> loaded: bool?, value: string?` | Returns `(loaded, failReason)` when nil/false. |
| `C_AddOns.DoesAddOnExist(name)` | `(name: uiAddon) -> exists: bool` | Omitted from historical summary; check before querying unknown addons. |
| `C_AddOns.DoesAddOnHaveLoadError(name)` | `(name: uiAddon) -> hadError: bool` | Useful diagnostic check for failed modules. |
| `C_AddOns.GetAddOnEnableState(name, character?)` | `(name, character="0") -> state: AddOnEnableState` | Enum `AddOnEnableState`: `None=0, Some=1, All=2` (documented under Retail/Classic enum files). |
| `C_AddOns.GetAddOnSecurity(name)` | `(name: uiAddon) -> security: AddOnSecurityStatus` | Enum `AddOnSecurityStatus`: `Secure=0, Insecure=1, Banned=2, NotAvailable=3`. |
| `C_AddOns.IsAddOnDefaultEnabled(name)` | `(name: uiAddon) -> defaultEnabled: bool` | Omitted from historical summary. |
| `C_AddOns.IsAddonVersionCheckEnabled()` / `SetAddonVersionCheck(enabled)` | `() -> isEnabled: bool` / `(enabled: bool)` | Omitted from historical summary. |
| `C_AddOns.GetScriptsDisallowedForBeta()` | `() -> disallowed: bool` | Omitted from historical summary. |

Other shared `C_AddOns` functions across all three targets: `GetNumAddOns`, `GetAddOnName`, `GetAddOnTitle`, `GetAddOnNotes`, `GetAddOnInterfaceVersion`, `GetAddOnMetadata`, `IsAddOnLoadOnDemand`, `EnableAddOn`, `DisableAddOn`, `EnableAllAddOns`, `DisableAllAddOns`, `SaveAddOns`, `ResetAddOns`, `ResetDisabledAddOns`, `GetAddOnLocalTable`.

## `C_AddOnProfiler` performance contracts

All three snapshots declare these **10** `C_AddOnProfiler` functions for CPU/memory profiling:

- `IsEnabled() -> enabled: bool`, `GetTicksPerSecond() -> frequency: BigInteger`
- `GetAddOnMetric(name, metric) -> result: number`, `GetApplicationMetric(metric) -> result: number`, `GetOverallMetric(metric) -> result: number`
- `GetTopKAddOnsForMetric(metric, k) -> results: table<AddOnProfilerResult>` (`{ addOnName, metricValue }`)
- `MeasureCall(func, arguments) -> results: AddOnProfilerCallResults, returns: LuaValueVariant`
- `AddMeasuredCallEvent(name)`
- `CheckForPerformanceMessage() -> msg: AddOnPerformanceMessage [MayReturnNothing]`, `AddPerformanceMessageShown(msg)` (`[HasRestrictions]`)

## Verified lifecycle event payloads

| Event | Exact declared payload (`[SynchronousEvent]`, all targets) | Usage rule |
|---|---|---|
| `ADDON_LOADED` | `(addOnName: cstring, containsBindings: bool)` | Compare `addOnName == myAddonName` before reading/initializing your `SavedVariables` and unregister once matched. |
| `PLAYER_ENTERING_WORLD` | `(isInitialLogin: bool, isReloadingUi: bool)` | Fires on zoning/instances as well as login/reload; gate one-time session setup on `isInitialLogin or isReloadingUi`. |
| `ADDONS_UNLOADING` | `(closingClient: bool)` | Fires as addons unload/commit `SavedVariables`; distinguish UI reload vs full client exit (`closingClient`). |
| `SAVED_VARIABLES_TOO_LARGE` | `(addOnName: cstring)` | Fires when a `SavedVariables` file exceeds client limits during load. |

## Safe `SavedVariables` initialization & migration

Guard both the root table type (`type(MyAddonDB) ~= "table"`) and numeric schema version before comparing `<`, because an uninitialized or legacy table without `schemaVersion` would throw `attempt to compare number with nil` in Lua:

```lua
local addonName = ...
local CURRENT_SCHEMA = 2

local f = CreateFrame("Frame")
f:RegisterEvent("ADDON_LOADED")
f:SetScript("OnEvent", function(self, _, loadedName)
    if loadedName ~= addonName then return end
    self:UnregisterEvent("ADDON_LOADED")

    if type(MyAddonDB) ~= "table" then MyAddonDB = {} end
    local version = type(MyAddonDB.schemaVersion) == "number" and MyAddonDB.schemaVersion or 0
    if version < 1 then
        if MyAddonDB.enabled == nil then MyAddonDB.enabled = true end
    end
    if version < 2 then
        if type(MyAddonDB.profile) ~= "table" then MyAddonDB.profile = {} end
    end
    MyAddonDB.schemaVersion = CURRENT_SCHEMA
end)
```
