# Loaded UI helpers, callbacks and secure templates

Reviewed 2026-10-31 at the commits in [target snapshots](../../wow-client-targets/references/targets.json). This is the entry point for current source-backed UI research. Historical helper lists remain useful for names; their old links are not current loading evidence. Generated native methods/types are searchable through the [API index](../../wow-api-index/SKILL.md); Lua-defined helpers and XML templates also need the source paths below.

## Pin and follow the owner

| Target | Foundational TOC | XML schema |
|---|---|---|
| Retail 12.1.5.70688 | [SharedXMLBase](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_SharedXMLBase/Blizzard_SharedXMLBase.toc) | [UI.xsd](https://github.com/Gethe/wow-ui-source/blob/d07eb00237d8891f153215db98a5df880a26cfe5/Interface/AddOns/Blizzard_SharedXML/UI.xsd) |
| Forever 1.60.1.70532 | [SharedXMLBase](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SharedXMLBase/Blizzard_SharedXMLBase.toc) | [UI.xsd](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SharedXML/UI.xsd) |
| Classic progression 5.5.4.70631 | [SharedXMLBase](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_SharedXMLBase/Blizzard_SharedXMLBase.toc) | [UI.xsd](https://github.com/Gethe/wow-ui-source/blob/e5d9b3a22c3f0f6f41ebac0e454f4969594261cf/Interface/AddOns/Blizzard_SharedXML/UI.xsd) |

For a helper, locate its definition, then the owning TOC/XML includes, dependency sequence, selected `[Family]`/`[Game]` file and `AllowLoad`/`AllowLoadGameType`/exclusion rules. Record load-on-demand and any required bootstrap. These selectors are Blizzard source-loading evidence, not third-party TOC directives to copy into an addon. A function name in a file for another game type does not establish availability.

## Forever source map

| Concern | Definition and loading evidence | What to preserve |
|---|---|---|
| Mixins | [Mixin.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SharedXMLBase/Mixin.lua), loaded by SharedXMLBase | `CreateFromMixins`/`Mixin` compose Lua members; they do not create native widget inheritance or make a protected operation permitted. |
| Pools | [Pools.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SharedXMLBase/Pools.lua), same TOC | Inspect the actual pool's acquire/release/reset contract. Reset retained state, anchors, scripts and callbacks appropriate to the object; do not assume all pooled objects are frames. |
| Callback registry | [CallbackRegistry.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SharedXMLBase/CallbackRegistry.lua) and [GlobalCallbackRegistry.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SharedXMLBase/GlobalCallbackRegistry.lua), same TOC | Event name, callback owner, extra bound arguments and unregistration lifecycle. |
| Formatting/layout/event utilities | [SharedXML TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_SharedXML/Blizzard_SharedXML.toc) loads FormattingUtil, TimeUtil, EventUtil, LayoutFrame and family/game overrides | Do not infer a helper's signature from its name or a Retail version. Follow nested XML files and overriding Lua. |
| Action templates | [SecureTemplates.xml](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_FrameXML/SecureTemplates.xml), [SecureTemplates.lua](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_FrameXML/SecureTemplates.lua), [FrameXML TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_FrameXML/Blizzard_FrameXML.toc) | `SecureActionButtonTemplate` inherits `SecureFrameTemplate` and attaches `SecureActionButtonMixin`. Preserve template attributes, input trigger and protected state; ordinary Lua cannot use inheritance to automate protected actions. |
| Restricted handlers | [RestrictedAddOnEnvironment TOC](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_RestrictedAddOnEnvironment/Blizzard_RestrictedAddOnEnvironment.toc), [SecureHandlerTemplates.xml](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_RestrictedAddOnEnvironment/SecureHandlerTemplates.xml) | The TOC permits game loading for classic, standard and camelot, depends on FrameXML and loads RestrictedEnvironment into a secure environment. Restricted snippets have a different API from ordinary addon Lua. |
| Native frames | [SimpleFrameAPI](https://github.com/Gethe/wow-ui-source/blob/ca8368f2f2380cbe696854f7f2646387c278a61b/Interface/AddOns/Blizzard_APIDocumentationGenerated/SimpleFrameAPIDocumentation.lua), plus the generated ScriptObject family | Preserve `IsProtectedFunction`, secret-argument annotations and per-method types. A documentation system name is not necessarily a valid `CreateFrame` type string. |

## Callback versus frame event

`CallbackRegistryMixin:RegisterCallback(event, func, owner, ...)` associates a callback with an owner; `UnregisterCallback(event, owner)` removes that registration. `EventRegistry:RegisterCallback` subscribes to a Lua callback; it does **not** inherently call `Frame:RegisterEvent`.

The global registry also provides `RegisterFrameEventAndCallback(frameEvent, ...)` and the matching `UnregisterFrameEventAndCallback`, plus a handle-based variant. These register a real frame event and forward it into the callback registry. Use a frame event only after validating its actual addon registration/access. Do not feed an internal callback such as `Legacy.UpdateCurrencyInfo` into `Frame:RegisterEvent`.

An addon-owned callback has a predictable lifecycle without inventing a Blizzard event:

```lua
local owner = {}
local function OnPreferenceChanged(self, value)
    self.enabled = value
end
EventRegistry:RegisterCallback("MyAddon.PreferenceChanged", OnPreferenceChanged, owner)
EventRegistry:TriggerEvent("MyAddon.PreferenceChanged", true)
-- When the owner is disabled or disposed:
EventRegistry:UnregisterCallback("MyAddon.PreferenceChanged", owner)
```

This pattern depends on the loaded registry described above. Use unique addon-owned names; do not publish fabricated Blizzard callbacks. For actual game events, see [events](../../wow-api-events/SKILL.md). For Legacy-specific bootstrap and callbacks, see [talents](../../wow-api-talents/SKILL.md).

## XML and widget inheritance

Use the selected `UI.xsd` to resolve element substitutions, base types, attributes, defaults and allowed child ordering. In the Forever schema, `LayoutFrameType` and `FrameType` define shared structure; `Frame` participates in the frame element hierarchy. `Ui` admits `Include` and `Script` elements. Schema inheritance, a native object's methods, Lua mixins and XML `inherits` are distinct mechanisms.

For each template used by an addon, record the defining XML, its base templates, any referenced mixins/scripts, file order and selected client's owning addon. Place addon Lua definitions before XML references that require them. Validate XML structure against the selected schema when tooling is available, then test actual loading; schema validity alone cannot establish a template's presence or secure runtime behavior.

For each frame method, search the concrete generated ScriptObject and relevant base objects. Shared method names do not prove they are implemented by every frame. The generated ledger preserves object/system identity; do not flatten all `Set*` methods into a global widget API. Check script-handler argument order separately from engine event payloads.

## Acceptance and non-generated boundaries

Current source-backed examples above still require an actual client check: initial loading, callback cleanup, template creation, inherited methods, input behavior and combat restrictions. For helpers not covered here or by generated declarations, retain the exact Lua definition and load trace as feature evidence; mark unresolved native globals explicitly. The old FrameXML references are historical discovery aids, not a claim that every named helper is current in all clients.
