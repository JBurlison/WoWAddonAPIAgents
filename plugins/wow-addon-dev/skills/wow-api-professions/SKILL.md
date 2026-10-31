---
name: wow-api-professions
description: Look up WoW Professions, Tradeskill, Crafting Orders, Recipe, and
  Profession Specialization APIs. Covers C_TradeSkillUI (recipe list, crafting,
  reagents, skill lines, categories, recrafting, salvage, enchanting),
  C_CraftingOrders (customer/crafter order system, public/private/guild orders,
  order creation, fulfillment, listing), C_ProfessionSpecUI (profession
  knowledge, specialization trees), global tradeskill functions, and
  profession-specific patterns. Use when working with professions, recipes,
  crafting, work orders, crafting orders, profession specialization, or
  tradeskill UI. Select Retail, Forever, or Classic with wow-client-targets
  before using historical listings.
---

# api professions

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify the target profession model: tradeskill recipes, skill lines, crafting orders, reagent quality, and specialization are separate capabilities. Do not impose Retail crafting schemas on Classic.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
