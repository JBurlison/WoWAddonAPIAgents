---
name: wow-api-index
description: Find source-pinned WoW functions, events, object methods, structures, enums and domain guidance across Retail, Forever and Classic progression. Use the packaged narrow-query tool and complete ownership routing before implementation.
---

# WoW API index

Resolve the client/build with [wow-client-targets](../wow-client-targets/SKILL.md). Start addon design or porting with [wow-addon-development](../wow-addon-development/SKILL.md). A namespace name, source declaration or lexical mention is not evidence that an operation loads or is permitted for addons.

## Current contracts

Use the [current reference guide](references/CURRENT-REFERENCES.md) and [package-local query tool](scripts/query.mjs) to retrieve only the desired symbol's full typed contract and security annotations. The ledger includes every generated function, event, object method, structure, enum, callback type, constant group and predicate at the pinned target commits. It retains explicit unknown load/runtime/access states.

With Node.js 22+, run `node <this-skill>/scripts/query.mjs forever C_Spell.GetSpellInfo` or `node <this-skill>/scripts/query.mjs forever SPELL_UPDATE_COOLDOWN --kind event`. Exact queries return full records; namespace searches return bounded summaries unless `--full` is used. No Node dependency is needed to follow the domain JSON links directly.

| Reference | Purpose |
|---|---|
| [Namespace lookup](references/NAMESPACE-LOOKUP.md) | Every declared C_ namespace, owner, target inventory and scope classification |
| [Domain routing](references/DOMAIN-SKILLS.md) | All installed skills and complete namespace/global/object/data-system ownership |
| [Category lookup](references/CATEGORY-LOOKUP.md) | Task-oriented categories, including Mail and Macros |
| [Current reference guide](references/CURRENT-REFERENCES.md) | Query usage, evidence meaning, structures, enums and representation rules |
| [Maintenance](references/MAINTENANCE.md) | Reproducible regeneration and offline semantic checks |

## Non-generated surfaces

Use [controller support](../wow-controller-support/SKILL.md) for required UI interaction assessment, native gamepad navigation, focus, action hints and per-client controller acceptance. Source declarations alone do not show that a custom panel is reachable or operable with a controller.

For task-level UI work, use [native UI composition](../wow-native-ui/SKILL.md) to select and assemble controls and [UI skinning](../wow-ui-skinning/SKILL.md) to restyle Blizzard-owned windows while preserving their behavior. The generated object-method ledger supplies contracts; these skills supply composition and lifecycle guidance.

Use [FrameXML](../wow-api-framexml/SKILL.md), [widgets](../wow-api-widget/SKILL.md), [XML](../wow-api-xml-schema/SKILL.md), [macros](../wow-macro-commands/SKILL.md), [settings/CVars](../wow-api-settings-system/SKILL.md) and [Lua/security](../wow-api-lua-environment/SKILL.md) for their separately sourced guides. Generated object methods do not enumerate all handwritten mixins, callbacks or template dependencies.

Follow current target-specific references first. Retained historical material is a research lead; never use it to override a pinned current signature or restriction. If a symbol is absent from the ledger, its status is unknown until loaded source and runtime evidence resolve it. Offline use must disclose the pinned build and untested behavior.
