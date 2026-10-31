---
name: wow-macro-commands
description: "Look up WoW macro commands (slash commands), macro conditionals,
  macro syntax and options, secure command rules, castsequence,
  #show/#showtooltip, and conditional targeting. Use when writing macros,
  explaining /cast, /use, /castsequence, conditionals like [mod], [harm],
  [help], [@unit], or any slash command behavior. Select Retail, Forever, or
  Classic with wow-client-targets before using historical listings."
---

# macro commands

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify slash commands, conditional tokens, secure command handling and execution limits for the selected client. Do not promise automatic protected actions from ordinary addon Lua.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

For secure action buttons, snippets and protected input, first trace the [current secure template sources](../wow-api-framexml/references/CURRENT-UI-SOURCES.md) and [Lua environment](../wow-api-lua-environment/SKILL.md). A macro command or template in source does not authorize automatic protected actions from addon Lua.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- [CONDITIONALS](references/CONDITIONALS.md)
- [SLASH COMMANDS](references/SLASH-COMMANDS.md)
- [SYNTAX](references/SYNTAX.md)

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
