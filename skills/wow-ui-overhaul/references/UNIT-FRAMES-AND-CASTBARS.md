# Unit frames and cast bars

Custom player, target, focus, pet, party, and raid frames must preserve Blizzard's secure targeting/menu interaction and respect Retail/Forever Secret Values on health, power, casts, and auras.

## Secure unit frames and group headers

Verify Blizzard's templates at your pinned commit before implementing (`Interface/AddOns/Blizzard_FrameXML/SecureTemplates.lua` and `Interface/AddOns/Blizzard_RestrictedAddOnEnvironment/SecureGroupHeaders.lua` across Retail `ab5cb850`, Forever `734f0653`, and Classic `e171ae99`):

- **Single unit frames** (`player`, `target`, `focus`, `pet`, `targettarget`):
  - Inherit `SecureUnitButtonTemplate` (and set `unit` attribute).
  - Call `RegisterUnitWatch(frame)` (outside combat) for frames that auto-show/hide based on unit existence (`target`, `focus`, `pet`), instead of calling `:Show()`/`:Hide()` in Lua during `PLAYER_TARGET_CHANGED`.
  - Bind clicks via `frame:RegisterForClicks("AnyUp")`, `frame:SetAttribute("*type1", "target")`, and `frame:SetAttribute("*type2", "togglemenu")` (plus `SecureClickBinding` / modifier attributes only when requested).
- **Party / Raid frames:** Use `SecureGroupHeaderTemplate` / `SecureGroupPetHeaderTemplate` configured via attributes (`showParty`, `showRaid`, `groupFilter`, `sortMethod`, `initialConfigFunction`) outside `InCombatLockdown()`. Never resize, reparent, or create secure unit buttons while in combat.

## Secret Values–safe health, power, cast, and aura rendering

On **Retail (`12.1.5.70961`)** and **Forever (`1.60.1.71037`)**, combat/unit APIs (`UnitHealth`, `UnitHealthMax`, `UnitPower`, `C_UnitAuras.GetAuraDataByIndex`, `UnitCastingInfo`) can return **Secret Values** (`canaccessvalue(v) == false`). Check exact contracts with `query.mjs` and [combat contracts](../../wow-api-combat/references/CURRENT-CONTRACTS.md):

- **DO NOT** compare (`hp == 0`, `hp < maxHp`), divide (`hp / maxHp`), format (`string.format("%d", hp)`), concatenate, or store secret values as table keys in Lua—doing so throws a Lua error or spreads taint.
- **DO** pass values straight into permitted Blizzard widget sinks when supported by the target client:
  - `statusBar:SetMinMaxValues(0, maxValue)` and `statusBar:SetValue(value)`
  - `fontString:SetText(value)` or `SetFormattedText` only with non-secret formats / Blizzard-provided `AbbreviateNumbers` or `UnitHealthPercent` where verified non-secret or safe-sink compatible
  - Duration objects (`LuaDurationObject`) straight into `statusBar:SetTimerDuration(...)` or `cooldown:SetCooldownFromDurationObject(...)`
- **Classic (`5.5.4.71060`)** lacks Secret Value restrictions on `UnitHealth` / `UnitPower` in the inspected generated docs, so wrap formatting/percentage helpers in a thin per-client adapter rather than forcing Retail-only or Classic-only assumptions across all three targets.

## Custom cast bars and aura rows

- Inspect `Interface/AddOns/Blizzard_UIPanels_Game/Shared/CastingBarFrame.lua` and `Interface/AddOns/Blizzard_UnitFrame/{Mainline,Classic,Shared}/UnitFrame.lua` via `fetch-source.mjs`.
- **Cast bars:** Register unit-filtered `RegisterUnitEvent("UNIT_SPELLCAST_START", unit)` (and `STOP`, `FAILED`, `INTERRUPTED`, `DELAYED`, `CHANNEL_START`, `CHANNEL_UPDATE`, `CHANNEL_STOP`, plus empower events where supported by the target). Style non-interruptible casts cleanly (distinct border/fill color) and keep spark textures anchored proportionally without allocating closures on `OnUpdate`.
- **Aura rows:** Use an `ObjectPool` or pre-allocated icon array with `UNIT_AURA`; update existing icon textures, stacks, and cooldown sweeps in place rather than rebuilding child frames on every event.
- **Class emblems, level badges, and gear/ilvl plates:** Derive class colors via `C_ClassColor.GetClassColor` / `RAID_CLASS_COLORS` and keep inspect-derived item level / gear score strictly cached and throttled (see [bags, chat, minimap, and tooltips](BAGS-CHAT-MINIMAP-TOOLTIPS.md)).
