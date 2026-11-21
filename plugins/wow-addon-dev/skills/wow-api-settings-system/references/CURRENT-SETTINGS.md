# Settings registration, CVars, input and media

Reviewed 2026-10-31 against earlier Retail/Forever/Classic pins (`d07eb002` / `ca8368f2` / `e5d9b3a2`); see [targets.json](../../wow-client-targets/references/targets.json) for current bundled snapshots (`12.1.5.70783`, `1.60.1.70938`, `5.5.4.70631`) and query [wow-api-index](../../wow-api-index/SKILL.md) for current contracts. Client operation remains to be tested in game.

## Settings UI and saved preferences

Follow [addon options](ADDON-OPTIONS.md) for baseline menu integration and acceptance, and [localization](../../wow-addon-development/references/LOCALIZATION.md) before constructing user-facing strings. The focused options source map supplies a newer dated contract review without relabeling this historical review as fresh.

The same registration signatures used below occur in the inspected [Retail Settings implementation](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_Settings_Shared/Blizzard_Settings.lua), [Forever implementation](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_Settings_Shared/Blizzard_Settings.lua) and [Classic implementation](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_Settings_Shared/Blizzard_Settings.lua) (verified present at current `targets.json` pins too). Shared source signatures do not prove identical panel availability in every client state.

| Helper | Contract and purpose |
|---|---|
| `Settings.VarType` | `{ Boolean = "boolean", String = "string", Number = "number" }`. |
| `Settings.RegisterVerticalLayoutCategory(name)` | Returns category and layout; suitable for standard controls. |
| `Settings.RegisterVerticalLayoutSubcategory(parentCategory, name)` | Registers a nested vertical-layout subcategory under `parentCategory`. |
| `Settings.RegisterCanvasLayoutCategory(frame, name)` | Returns category and layout; displays the addon's custom frame. Canvas may implement `OnCommit`, `OnDefault`, `OnRefresh` as described in the owning implementation. |
| `Settings.RegisterAddOnSetting(category, variable, variableKey, variableTbl, variableType, name, defaultValue)` | Returns a setting, initializes a nil value and writes subsequent changes to `variableTbl[variableKey]`. Use a unique namespaced `variable`. |
| `Settings.RegisterProxySetting(categoryTbl, variable, variableType, name, defaultValue, getValue, setValue)` | Backs a setting with custom `getValue()` / `setValue(value)` closures (for example, AceDB profiles or computed values) instead of a raw table key. |
| `Settings.CreateCheckbox(category, setting, tooltip)` | Creates the UI initializer for a boolean setting. |
| `Settings.CreateSliderOptions(minValue, maxValue, rate)` + `Settings.CreateSlider(category, setting, options, tooltip)` | Configures min/max/step (`options:SetLabelFormatter(...)` optional) and attaches a slider initializer. |
| `Settings.CreateControlTextContainer()` (`:Add(value, label, tooltip)`) + `Settings.CreateDropdown(category, setting, options, tooltip)` | Supplies selectable radio/dropdown entries via `function() return container:GetData() end` and attaches a dropdown initializer. |
| `Settings.RegisterAddOnCategory(category)` | Exposes the category under addon settings. |
| `Settings.OpenToCategory(categoryID, scrollToElementName)` | Opens through `C_SettingsUtil.OpenSettingsPanel`; use `category:GetID()`, not an assumed display-name API, and guard against combat lockdown (`InCombatLockdown()`). |

Initialize SavedVariables after the addon's own `ADDON_LOADED`, not at file parse time. The [Forever implementation guide](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_Settings_Shared/Blizzard_ImplementationReadme.lua) documents the addon-facing registration flow. This minimal example needs `## SavedVariables: MyAddonSettings` in the selected client's TOC:

```lua
local addonName, ns = ...
local L = ns.L -- Load the complete base catalog and locale overrides first.
local category
local loader = CreateFrame("Frame")
loader:RegisterEvent("ADDON_LOADED")
loader:SetScript("OnEvent", function(self, _, loadedName)
    if loadedName ~= addonName then return end
    self:UnregisterEvent("ADDON_LOADED")
    if type(MyAddonSettings) ~= "table" then MyAddonSettings = {} end
    if MyAddonSettings.enabled == nil then MyAddonSettings.enabled = true end
    if MyAddonSettings.scale == nil then MyAddonSettings.scale = 1.0 end
    if MyAddonSettings.mode == nil then MyAddonSettings.mode = "compact" end

    if not (Settings and Settings.RegisterVerticalLayoutCategory
        and Settings.RegisterAddOnSetting and Settings.CreateCheckbox
        and Settings.RegisterAddOnCategory) then
        print(L.OPTIONS_UNAVAILABLE)
        return
    end
    category = Settings.RegisterVerticalLayoutCategory(addonName)
    local enabled = Settings.RegisterAddOnSetting(category,
        addonName .. "_ENABLED", "enabled", MyAddonSettings,
        Settings.VarType.Boolean, L.OPTIONS_ENABLED, true)
    Settings.CreateCheckbox(category, enabled, L.OPTIONS_ENABLED_TOOLTIP)

    if Settings.CreateSlider and Settings.CreateSliderOptions then
        local scaleSetting = Settings.RegisterAddOnSetting(category,
            addonName .. "_SCALE", "scale", MyAddonSettings,
            Settings.VarType.Number, L.OPTIONS_SCALE, 1.0)
        local sliderOpts = Settings.CreateSliderOptions(0.5, 2.0, 0.05)
        Settings.CreateSlider(category, scaleSetting, sliderOpts, L.OPTIONS_SCALE_TOOLTIP)
    end

    if Settings.CreateDropdown and Settings.CreateControlTextContainer then
        local modeSetting = Settings.RegisterAddOnSetting(category,
            addonName .. "_MODE", "mode", MyAddonSettings,
            Settings.VarType.String, L.OPTIONS_MODE, "compact")
        local function GetModeOptions()
            local c = Settings.CreateControlTextContainer()
            c:Add("compact", L.MODE_COMPACT)
            c:Add("full", L.MODE_FULL)
            return c:GetData()
        end
        Settings.CreateDropdown(category, modeSetting, GetModeOptions, L.OPTIONS_MODE_TOOLTIP)
    end

    Settings.RegisterAddOnCategory(category)
end)

SLASH_MYADDON1 = "/myaddon"
SlashCmdList.MYADDON = function()
    if InCombatLockdown() then
        print(L.CANNOT_OPEN_IN_COMBAT)
        return
    end
    if category and Settings and Settings.OpenToCategory then
        Settings.OpenToCategory(category:GetID())
    end
end
```

The base catalog must define every `L.*` key referenced above; a stable proper addon name can remain the category title. This demonstrates persistence and registration, not the addon's display implementation. If behavior must update immediately, attach `setting:SetValueChangedCallback(function(setting, value) ... end)` and apply the ordinary saved value to addon-owned UI. Apply the initial saved state separately. Register once and open the category from a user action; do not recreate settings every time the panel opens.

Loading evidence matters: [Blizzard_Settings_Shared.toc](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_Settings_Shared/Blizzard_Settings_Shared.toc) loads the API, inbound bridge and panel; [SettingsDefinitions_Shared](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SettingsDefinitions_Shared/Blizzard_SettingsDefinitions_Shared.toc) depends on it. `Blizzard_Settings` is a separate load-on-demand marker addon; loading that marker alone is not proof that the full shared UI is ready. If the verified registration path is unavailable, keep saved preferences intact and use a separately verified custom panel.

## CVar contracts and permissions

Use public CVars for actual client options; use SavedVariables for arbitrary addon preferences. Query `wow-api-index` for current per-target declarations (note that Classic, Forever, and Retail differ at the bundled snapshots):

| Function | Contract and target scope |
|---|---|
| `C_CVar.AreCVarsLoaded()` | **Retail & Forever only** (absent in Classic generated inventory). Returns `loaded: bool`; do not infer a loaded value from a missing result. |
| `C_CVar.GetCVar(name)` | Returns `string?` (`SecretArguments=NotAllowed` on Retail & Forever). |
| `C_CVar.GetCVarBool(name)` | Returns `bool?`; unknown is distinct from false. |
| `C_CVar.GetCVarBitfield(name, index)` | Returns `bool?`; index is a `luaIndex`. |
| `C_CVar.GetCVarDefault(name)` | Returns `string?`; requires a valid public CVar. |
| `C_CVar.GetCVarInfo(name)` | Ordered tuple: `value, defaultValue, isStoredServerAccount, isStoredServerCharacter, isLockedFromUser, isSecure, isReadOnly`. |
| `C_CVar.SetCVar(name, value)` | Retail & Forever: `C_CVar.SetCVar(name, value?) -> success: bool` (requires valid public, non-read-only, non-secure CVar; `FailureMode=ReturnNothing`). Classic: `(name, value?, scriptCVar?) -> success: bool`. |
| `C_CVar.SetCVarBitfield(name, index, value)` | Retail & Forever: 3 args, invalid index errors (`RequiresIndexInRange [FailureMode=Error]`). Classic: optional 4th `scriptCVar?` arg, invalid index returns nothing (`IsIndexInRange [FailureMode=ReturnNothing]`). |
| `C_CVar.SetTempCVar(name, value)` / `C_CVar.RemoveTempCVar(name)` | **Forever only** (missing in Retail & Classic); temporary override operations returning nothing, subject to the same public/non-read-only/non-secure CVar preconditions. |
| `C_CVar.RegisterCVar(name, value)` | Value is optional; registration does not establish storage scope or write permissions for an existing CVar. |
| `C_CVar.ResetTestCVars()` | Declared test/reset operation; do not use it as an addon-wide preference reset. |

At the pinned snapshots, setters require a **valid public, non-read-only, non-secure CVar**, and Retail/Forever prohibit secret arguments (`SecretArguments=NotAllowed`). `RequiresNonSecureCVar` / `IsNotSecure` is not a promise that any secure CVar can be written once combat ends. Do not treat `/console` or a legacy alias as a permission bypass. For `SetCVar`, accept success only when the result is `true`; inspect ordinary readback and retain explicit failure/no-result handling. Only pass `scriptCVar` inside a Classic-specific adapter.

Read the account/character flags rather than assuming storage scope from a name. Temporary overrides and ordinary persisted settings are different operations. Test reload and logout/restart separately; a setting that survives `/reload` has not thereby passed a restart-persistence test. Reset only the requested CVar to its verified default and restore only values the addon itself changed.

## Input, Edit Mode, sound, video and time

| Subsystem | Source-backed entry points and implementation boundary |
|---|---|
| Keybindings | [KeyBindings declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/KeyBindingsDocumentation.lua): `C_KeyBindings.GetBindingIndex(action) -> luaIndex?`, `GetBindingContextForAction(action) -> BindingContext?`, `IsBindingContextActive(context) -> bool`. `ActivateBindingContext` and `DeactivateBindingContext` are marked `HasRestrictions`. Context APIs are not substitutes for persistent binding assignment. Inspect loaded `Bindings.xml`, the selected client's binding globals and combat restrictions before modifying bindings; don't overwrite a user's binding set merely to display shortcuts. |
| Gamepad | [GamePad declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/GamePadDocumentation.lua): `C_GamePad.GetAllDeviceIDs()` enumerates IDs; `C_GamePad.GetDeviceMappedState(deviceID?) -> GamePadMappedState?`. Handle no device/state. Use semantic mapped controls for UI hints; confirm raw device/config operations and supported platform separately. |
| Edit Mode | [EditModeManager declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/EditModeManagerDocumentation.lua): `C_EditMode.GetLayouts() -> EditModeLayouts`, `ConvertStringToLayoutInfo(text)` may return nothing, `SaveLayouts(saveInfo)` mutates layout state. Preserve the complete structure and user's layouts. These functions do not imply a public registration API for arbitrary addon frames. Follow the owning EditMode TOC/UI and test any integration; use addon-owned anchors when appropriate. |
| Audio | [Sound declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SoundDocumentation.lua): `C_Sound.PlaySound(soundKitID, uiSoundSubType, forceNoDuplicates, runFinishCallback, overridePriority?, volumeOverride?) -> success, soundHandle`, with possible no-result. Preserve documented defaults and use `UISoundSubType`, not a guessed legacy channel string. Classic's inspected signature lacks `volumeOverride`. Check `C_Sound.IsPlaying(soundHandle)` only for an obtained handle. Respect the user's audio settings. |
| Video | [Video declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/VideoDocumentation.lua) use **`C_VideoOptions`**. Query `GetGameWindowSizes`, `GetCurrentGameWindowSize` and support predicates before offering an explicit user-selected change. `SetGameWindowSize` is a mutation, not a harmless layout read; platform support and actual effect need verification. |
| Time | [SystemTime](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SystemTimeDocumentation.lua) declares `GetTime`, `GetServerTime`, `GetGameTime` and `GetLocalGameTime` with different semantics. [DateAndTime](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/DateAndTimeDocumentation.lua) declares `C_DateAndTime.GetCurrentCalendarTime() -> CalendarTime`. Do not persist a session-relative clock as a real-world date. |
| Build | [Build declarations](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/BuildDocumentation.lua) define `GetBuildInfo`. Record the build/interface in acceptance evidence; do not compare interface numbers against a Retail-only threshold to detect Forever. |

For all these systems, a namespace in a shared generated tree is a lookup lead. The bundled per-target records retain signatures and annotations; only the target's loaded UI and successful, permitted client operation can close runtime uncertainty.
