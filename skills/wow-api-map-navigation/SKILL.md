---
name: wow-api-map-navigation
description: Look up WoW Map, Navigation, Area POI, Taxi, Vignette, Minimap,
  Nameplate, Waypoint, Zone Ability, Fog of War, and Exploration APIs. Covers
  C_Map (50+ functions for map data, coordinates, map IDs, area info),
  C_MapExplorationInfo, C_AreaPoiInfo, C_TaxiMap (flight paths), C_Vignette,
  C_SuperTrackManager, C_Navigation (in-game navigation), C_ZoneAbility,
  C_FogOfWar, Minimap functions, C_NamePlateManager, and coordinate conversion.
  Use when working with maps, coordinates, waypoints, flight paths, minimap,
  nameplates, vignettes, exploration, zone abilities, or in-game navigation.
  Select Retail, Forever, or Classic with wow-client-targets before using
  historical listings.
---

# api map navigation

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify map IDs, coordinate spaces, map data availability, taxi/waypoint APIs and world-map loading. Expansion-specific navigation capabilities need separate checks.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
