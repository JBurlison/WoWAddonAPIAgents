> **Historical Retail baseline:** Retained from the original repository. Claims and examples require re-verification for every selected client, including current Retail. Follow the [active skill](../SKILL.md) first.

# WoW Settings System (CVars and Console)

Use this skill when you need to explain or work with console variables (CVars) and console commands in WoW Retail.

## What CVars Are

- CVars are client configuration values that affect graphics, sound, UI, and gameplay behavior.
- Many settings in the in-game Interface options map directly to CVars.
- The authoritative, up-to-date list is on the wiki. Use it instead of copying large lists.

Reference: https://warcraft.wiki.gg/wiki/Console_variables

## Reading and Setting CVars

### API (AddOns or scripts)

- Read: `GetCVar(name)` returns a string value.
- Read default: `GetCVarDefault(name)` returns the coded default value.
- Inspect: `GetCVarInfo(name)` can indicate if a CVar is secure.
- Write: `SetCVar(name, value)` sets a value as a string.

Example:

```lua
-- Enable UI error popups
SetCVar("scriptErrors", 1)
```

### /console Command

- Use `/console <name> <value>` in chat.
- Example:

```
/console scriptErrors 1
```

### Console Window

- Enable with `/console enable` or start the client with `-console`.
- Open the console window with the ` or ~ key.

## Secure CVars and Combat Restrictions

Correction for the pinned 2026-10-31 sources: do not infer that a secure CVar becomes writable outside combat. Retail/Forever `C_CVar.SetCVar` requires a valid public, non-read-only, **non-secure** CVar. Failed preconditions can return nothing. A global alias or `/console` is not a permission bypass. Inspect `C_CVar.GetCVarInfo` and the selected client's predicates; see [current CVar contracts](CURRENT-SETTINGS.md).

## CVar Scope (Account vs Character)

- Some CVars are account-wide, others are character-specific.
- Character or account specific values may sync to the server (when `synchronizeConfig` is enabled).
- Changing a character specific CVar only affects the current character.

## Resetting CVars

- Reset one CVar to default:

```lua
SetCVar("autoSelfCast", GetCVarDefault("autoSelfCast"))
```

- Console reset:

```
/console cvar_default autoSelfCast
```

- Full reset:

```
/console cvar_default
```

Note: Account or character specific CVars that are synced may persist even after reinstalling or deleting the WTF folder.

## Config Files (When the Game Is Not Running)

- `WTF/Config.wtf` stores startup and global settings.
- `WTF/Account/<AccountName>/config-cache.wtf` and per-character `config-cache.wtf` store account or character scoped values.
- Only edit these files while the game is closed or changes will be overwritten.

## Discovering CVars and Console Commands

- The wiki list is the most complete, searchable source.
- The console command list is also on the same page.
- Some console APIs expose command lists (see the API docs for `C_Console`).

Reference: https://warcraft.wiki.gg/wiki/Console_variables

## Additional Notes

See [references/CVARS-OVERVIEW.md](./CVARS-OVERVIEW.md) for a short, curated set of workflow tips, pitfalls, and reset guidance.

## When to Use This Skill

- You need to explain how to set or read CVars from an addon or script.
- You need to clarify CVar scope, secure restrictions, or reset behavior.
- You need guidance on console command usage or config file locations.
