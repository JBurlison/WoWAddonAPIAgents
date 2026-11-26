# Nameplates

Nameplates are pooled, high-frequency frames with strict protected hitbox rules and instance/combat restrictions.

## Lifecycle and API contracts

Inspect `Interface/AddOns/Blizzard_NamePlates/Blizzard_NamePlates.toc`, `Blizzard_NamePlates.lua`, `Blizzard_NamePlateBase.lua`, and `Blizzard_NamePlateUnitFrame.lua` at your pinned commit, and query `C_NamePlate` via `query.mjs`:

- **Core events:** `NAME_PLATE_CREATED`, `NAME_PLATE_UNIT_ADDED` (`unitToken`), and `NAME_PLATE_UNIT_REMOVED` (`unitToken`).
- **Lookup:** `C_NamePlate.GetNamePlateForUnit(unitToken, includeForbidden)` and `C_NamePlate.GetNamePlates(includeForbidden)` (check `SecretArguments=AllowedWhenUntainted` on Retail `ab5cb850` and Forever `734f0653`).

## Forbidden plates, hitboxes, and Secret Values

1. **Always check `plate:IsForbidden()` first:** Friendly plates in dungeons/raids or restricted frames can be forbidden; touching child regions or calling layout methods on a forbidden plate throws protected errors. Skip forbidden plates immediately.
2. **Preserve Blizzard's secure hitbox:** Never resize or reparent `plate` itself inside combat, and never hide/replace the underlying clickable `UnitFrame` hitbox when adding custom health/cast/aura overlays. Anchor addon-owned visual frames to `plate.UnitFrame` (or hide Blizzard's visual children selectively via alpha `0` / verified module hooks while keeping hit rects intact).
3. **Secret Values on Retail/Forever:** Pass enemy health/cast/aura values directly to permitted widget sinks (`StatusBar:SetValue`, `StatusBar:SetTimerDuration`, `FontString:SetText`) rather than comparing or formatting opaque secret values in Lua.
4. **Zero-allocation updates:** Pre-create health bar, cast bar, threat glow, raid icon, quest icon, and aura slots on `NAME_PLATE_CREATED` in a weak-keyed addon table; on `NAME_PLATE_UNIT_ADDED` / `REMOVED`, only bind/clear state without creating frames or tables per event.

## Target differences

- Retail `12.1.5.70961`, Forever `1.60.1.71037`, and Classic `5.5.4.71060` share `Blizzard_NamePlates` base files, while `Mainline\Blizzard_ClassNameplateBar*.lua` is gated by `[AllowLoadGameType mainline]`. Always verify target CVar/nameplate sizing contracts (`C_NamePlate.SetNamePlateSize` / `NamePlateDriverFrame`) per client before assuming identical scale or friendly-plate behavior.
