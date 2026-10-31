> **Historical Retail baseline:** Retained from the original repository. Claims and examples require re-verification for every selected client, including current Retail. Follow the [active skill](../SKILL.md) first.

# WoW Lua API (Lua 5.1)

## Scope
- Retail only.
- Covers the Lua functions list and WoW-specific notes from warcraft.wiki.gg.
- Does not cover OS or file IO libraries (they are not available in the WoW client).

## When to use this skill
- You need behavior or signatures for base Lua 5.1 functions used in addons.
- You want Blizzard-specific differences (for example degrees vs radians).
- You need WoW-only helpers like `strsplit`, `table.wipe`, or `fastrandom`.

## How to use this skill
1. Start with references/OVERVIEW.md for environment notes and scope.
2. Use the library reference that matches the function you need.
3. Read the detail files for method-call syntax and table method caveats.

## Reference files
- references/OVERVIEW.md - Page-level notes, availability, and links.
- references/BASIC_FUNCTIONS.md - Lua base functions and behavior notes.
- references/MATH_LIBRARY.md - Math library plus Blizzard degree wrappers.
- references/STRING_LIBRARY.md - Standard and WoW-specific string helpers.
- references/STRING_DETAILS.md - String method-call syntax and pitfalls.
- references/TABLE_LIBRARY.md - Table helpers and WoW additions.
- references/TABLE_DETAILS.md - Table method-call behavior and wipe caveat.
- references/BIT_LIBRARY.md - bitlib functions and performance notes.
- references/COROUTINE_LIBRARY.md - Coroutine functions and cautions.
- references/DEPRECATED_FUNCTIONS.md - Deprecated or obsolete functions.

## Sources
- https://warcraft.wiki.gg/wiki/Lua_functions
- http://www.lua.org/manual/5.1/manual.html
