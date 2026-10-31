> **Historical Retail reference:** Verify this material for the selected client/build using [wow-client-targets](../../wow-client-targets/SKILL.md). This file does not establish current or cross-version API availability.

# CVar Overview Notes

This file is a short, curated helper and not a full list of CVars.
For the complete list, see https://warcraft.wiki.gg/wiki/Console_variables

## Quick Workflow

- Start with the selected client's `C_CVar` declarations and [current contracts](CURRENT-SETTINGS.md); verify any legacy global aliases independently.
- Use `/console` for one-off changes and debugging.
- Edit Config.wtf only while the game is closed.

## Secure CVars

- At the pinned Retail/Forever builds, `C_CVar.SetCVar` requires a non-secure, non-read-only, valid public CVar. Leaving combat does not override those preconditions.
- Use `C_CVar.GetCVarInfo` to inspect secure, read-only, user-lock and storage flags. Failed setter preconditions can produce no result.
- Neither `/console` nor a legacy alias bypasses access restrictions.

## Scope and Sync

- Some CVars are account wide, others are character specific.
- `config-cache.wtf` values can sync to the server when `synchronizeConfig` is enabled.
- Resetting may not clear synced values; use `cvar_default` or set defaults explicitly.

## Resetting

- Reset a single CVar with `SetCVar(name, GetCVarDefault(name))`.
- Use `/console cvar_default` to reset all CVars to defaults.
- Use `/console cvar_reset` to reset to startup values.

## Discovering CVars and Commands

- The wiki list is updated periodically; check the page header for patch versions.
- Console commands like `cvar_default`, `cvar_reset`, and `cvarlist` are documented on the same page.
- API helpers like `C_Console.GetAllCommands` can enumerate console commands.

## Safety Tips for AddOns

- Avoid changing CVars without explicit user opt-in.
- If you modify CVars, store previous values and restore on disable when appropriate.
