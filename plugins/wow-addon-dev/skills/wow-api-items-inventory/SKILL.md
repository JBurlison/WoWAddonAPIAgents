---
name: wow-api-items-inventory
description: Look up WoW Item, Container (Bag), Bank, Loot, Equipment, Socket,
  Upgrade, Merchant, and World Loot Object APIs. Covers C_Item
  info/count/cooldown/equip/type checks, C_Container bag slots/sort/search/use,
  C_Bank tabs/deposit/withdraw, C_Loot roll/legacy mode, C_ItemSocketInfo gem
  sockets, C_ItemInteraction conversion, C_MerchantFrame vendor buy/sell/repair,
  item location/mixin patterns, and looting functions. Use when working with
  items, bags, inventory, bank, loot, equipment sets, item sockets, item
  upgrades, merchants, vendors, item links, or world loot objects. Select
  Retail, Forever, or Classic with wow-client-targets before using historical
  listings.
---

# api items inventory

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify C_Container/C_Item signatures, bag IDs, result tables versus tuples, bank variants, and item-data loading. Normalize only verified fields in the target adapter.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
