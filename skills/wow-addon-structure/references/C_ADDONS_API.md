> **Historical Retail reference:** Verify this material for the selected client/build using [wow-client-targets](../../wow-client-targets/SKILL.md) and [CURRENT-STRUCTURE.md](CURRENT-STRUCTURE.md). This file does not establish current or cross-version API availability.

# C_AddOns API (Retail)

## Purpose
`C_AddOns` provides metadata, enable state, load state, and version-check APIs for AddOns. See [CURRENT-STRUCTURE.md](CURRENT-STRUCTURE.md) for full pinned signatures and `C_AddOnProfiler` contracts across Retail, Forever, and Classic progression.

## Core query functions
- `C_AddOns.GetNumAddOns()` - Number of AddOns installed.
- `C_AddOns.GetAddOnName(index)` - Name from index.
- `C_AddOns.GetAddOnInfo(name)` - Returns 6 values starting with `name, title, notes, loadable, reason, security` (do not skip `name` when unpacking).
- `C_AddOns.GetAddOnTitle(name)` - Title from .toc.
- `C_AddOns.GetAddOnNotes(name)` - Notes from .toc.
- `C_AddOns.GetAddOnInterfaceVersion(name)` - Interface version from .toc.
- `C_AddOns.GetAddOnMetadata(name, key)` - Metadata values (`Title`, `Notes`, `Author`, `Version`, `X-...`).
- `C_AddOns.GetAddOnDependencies(name)` - Returns required dependencies as multiple `cstring` return values (`deps...`).
- `C_AddOns.GetAddOnOptionalDependencies(name)` - Returns optional dependencies as multiple `cstring` return values (`deps...`).
- `C_AddOns.DoesAddOnExist(name)` / `C_AddOns.DoesAddOnHaveLoadError(name)` / `C_AddOns.IsAddOnDefaultEnabled(name)` / `C_AddOns.GetAddOnSecurity(name)` - Existence, load error, default-enabled state, and security status queries.

## Load state functions
- `C_AddOns.IsAddOnLoaded(name)` - Returns `loadedOrLoading: bool, loaded: bool`.
- `C_AddOns.IsAddOnLoadable(name[, character[, demandLoaded]])` - Returns `loadable: bool, reason: cstring`.
- `C_AddOns.IsAddOnLoadOnDemand(name)` - Returns if `LoadOnDemand` is enabled.
- `C_AddOns.LoadAddOn(name)` - Loads a `LoadOnDemand` AddOn (`-> loaded: bool?, value: string?`).

## Enable, disable, and version checks
- `C_AddOns.EnableAddOn(name[, character])` / `C_AddOns.DisableAddOn(name[, character])`
- `C_AddOns.EnableAllAddOns([character])` / `C_AddOns.DisableAllAddOns([character])`
- `C_AddOns.GetAddOnEnableState(name[, character])` - Returns `AddOnEnableState`.
- `C_AddOns.SaveAddOns()` / `C_AddOns.ResetAddOns()` / `C_AddOns.ResetDisabledAddOns()`
- `C_AddOns.IsAddonVersionCheckEnabled()` / `C_AddOns.SetAddonVersionCheck(enabled)` / `C_AddOns.GetScriptsDisallowedForBeta()`

## Namespace table access
- `C_AddOns.GetAddOnLocalTable(name)` - Returns the AddOn namespace table when `AllowAddOnTableAccess` is set in the .toc.

## Notes
- `UIParentLoadAddOn` is a FrameXML helper, not a public AddOn API. Prefer `C_AddOns.LoadAddOn`.
- Avoid deprecated global APIs when a `C_AddOns` function exists.

## Examples

Example 1 - Load a LOD AddOn if possible:
```
local name = "MyAddon_Extras"
local loadable = select(1, C_AddOns.IsAddOnLoadable(name))
if loadable and not C_AddOns.IsAddOnLoaded(name) then
  C_AddOns.LoadAddOn(name)
end
```

Example 2 - Read metadata safely:
```
local title = C_AddOns.GetAddOnMetadata("MyAddon", "Title")
local version = C_AddOns.GetAddOnMetadata("MyAddon", "Version")
```

Example 3 - Disable an AddOn and persist the state:
```
C_AddOns.DisableAddOn("MyAddon")
C_AddOns.SaveAddOns()
```

## Sources
- [Current structure & C_AddOns reference](CURRENT-STRUCTURE.md) and [wow-api-index](../../wow-api-index/SKILL.md)
- https://warcraft.wiki.gg/wiki/World_of_Warcraft_API
