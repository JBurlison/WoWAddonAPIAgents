# Compatibility decisions

Use the pinned commits and evidence paths in [targets.json](targets.json). This is a decision guide, not a universal API compatibility table. See [SOURCE-EVIDENCE.md](SOURCE-EVIDENCE.md) for observations at the bundled commits. Old Retail references retain their original scope.

| System | Shared design | Verify separately for Retail, Forever, and Classic |
|---|---|---|
| Loading and persistence | Initialize saved data after the addon's `ADDON_LOADED`; handle login/reload deliberately. | TOC directives, `C_AddOns` versus any legacy functions, dependency presence, load-on-demand behavior. Do not copy Blizzard-only directives into third-party TOCs. |
| TOCs and packaging | One addon name and SavedVariables schema, separate artifacts per target. | Interface value against the actual client, file list, optional libraries, client-specific modules. Avoid unverified TOC suffixes/conditional syntax by packaging a normal `<Addon>.toc` for each client. |
| Auras | Normalize only fields the feature actually uses in a compatibility adapter. | `C_UnitAuras` functions, aura data fields, instance IDs, `UNIT_AURA` payloads, secret-value annotations and permitted use. Do not assume old tuple APIs are needed because a target is named Classic. |
| Spells and spellbook | Expose semantic operations, such as spell display data or a cooldown update. | `C_Spell`/`C_SpellBook` signatures, spell identifier types, tables versus tuples, bank enums, override spells, cooldown duration objects and restricted values. |
| Bags and inventory | Convert results to the few fields needed by shared code. | `C_Container`, slot/bag identifiers, item data tables versus tuples, bank/reagent systems, async item loading. Never unpack a modern table as a legacy tuple. |
| Talents | Keep UI/feature logic independent of a particular talent tree representation. | Loaded talent UI, class traits versus talent/glyph APIs, specialization and talent identifiers, supported respec operations. Mark unsupported tree operations per target instead of treating all clients as Retail. |
| Settings | Keep preferences and SavedVariables independent of the settings UI adapter. | Loaded Settings registration APIs and panels; use a verified custom panel if a target lacks the desired integration. Do not assume the obsolete InterfaceOptions API is present on every non-Retail client. |
| Combat | Register only verified addon-facing events; handle secure frame changes outside combat. | `COMBAT_LOG_EVENT_UNFILTERED`, `CombatLogGetCurrentEventInfo`, payload shapes, access annotations, secrets, built-in meters, instance restrictions. Source presence is not addon permission. Old Retail restrictions do not establish Forever/Classic behavior. |
| Widgets and templates | Prefer minimal frames and local UI code when portability matters. | Template existence, owning Blizzard addon/load order, mixins, method signatures and restricted operations. Shared generated docs can mention widgets not loaded for the target. |
| Housing and expansion features | Keep feature modules optional and out of unsupported artifacts. | Actual client loading and addon-facing availability. Generated housing files occur in multiple branches; their presence does not certify housing support. Treat unverified features as unknown and do not ship dependent code. |

## Adapter contract

Keep target-specific branches in one module per differing system. For example, define an internal `GetSpellDisplayInfo(spellID)` returning your own documented fields, then implement it against each verified client signature. Keep opaque/secret results opaque: an adapter must not compare or normalize a restricted value into an ordinary number. Bind a client implementation once during initialization where possible.

Distinguish three failures: unavailable capability (report unsupported feature), temporarily missing data (use the documented asynchronous lifecycle), and restricted access (use permitted display paths or omit the feature). Do not turn all three into `nil` and claim full compatibility.

## Deprecation policy

Prefer supported replacements on the selected client. A legacy function still needed by one supported target may remain in that target's adapter even if removed elsewhere. Preserve a source citation and a test scenario; never delete it solely because a Retail reference calls it deprecated.
