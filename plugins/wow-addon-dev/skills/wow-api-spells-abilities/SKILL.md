---
name: wow-api-spells-abilities
description: Look up WoW Spell, SpellBook, ActionBar, Cooldown, Totem, and
  Shapeshifting APIs. Covers C_Spell info/cooldown/usability/range, C_SpellBook
  navigation/slot queries, C_ActionBar slot management/state/overrides,
  C_SpellActivationOverlay procs, C_SpellDiminish DR tracking, C_CooldownViewer,
  C_AssistedCombat rotation helpers, totem queries, shapeshift forms,
  casting/channeling functions, flyouts, spell confirmation, and global spell
  category functions. Use when working with spells, abilities, action bars,
  cooldowns, casting, totems, shapeshift forms, spell procs, or diminishing
  returns. Select Retail, Forever, or Classic with wow-client-targets before
  using historical listings.
---

# api spells abilities

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify C_Spell/C_SpellBook signatures, SpellInfo table shapes, spell overrides, bank enums, cooldown representation, and secret-value restrictions. Isolate actual differences in adapters.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [ACTIONBAR](references/ACTIONBAR.md)
- [COOLDOWNS CASTING](references/COOLDOWNS-CASTING.md)
- [SPELLBOOK](references/SPELLBOOK.md)
- [SPELLS CORE](references/SPELLS-CORE.md)
- [TOTEM SHAPESHIFT](references/TOTEM-SHAPESHIFT.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
