# Shared source, separate client artifacts

Adapt this layout to the user's project rather than moving an established addon unnecessarily:

```text
src/
  Init.lua
  Core.lua
  UI.lua
  Compat/
    Retail.lua
    Forever.lua
    Classic.lua
dist/
  retail/MyAddon/MyAddon.toc
  forever/MyAddon/MyAddon.toc
  classic/MyAddon/MyAddon.toc
```

Each artifact contains copies of the common source plus only its selected compatibility implementation. Its ordinary `MyAddon.toc` lists `Init.lua`, the selected compatibility module, then `Core.lua` and `UI.lua`. Set `## Interface` using the target's verified build; do not copy a fixed Retail value into all three TOCs. Create ZIPs with `MyAddon/` at their root, not `dist/retail/`.

In `Init.lua`, obtain the addon table with `local addonName, ns = ...`. The selected compatibility module assigns `ns.target = "retail"` (or the other target) and the project's adapter functions. Shared code uses the adapter, not scattered guesses based on API existence. Check the packaged target against verified project/build information on startup and provide a clear wrong-client message when it disagrees.

If one artifact must run on several clients, first verify the active `WOW_PROJECT_ID` assignments and loading paths in every selected commit. Use symbolic constants, not magic numbers. A missing or shared constant must not silently map to Retail. Use capability checks for the exact operation after identity is established, including signatures and access semantics.

Keep a shared SavedVariables schema when practical. Separate WoW installations do not automatically share saved data. If users copy saved files between clients, validate feature-specific fields and use explicit schema migrations. Never promise cross-client synchronization from identical variable names alone.

Record targets in the addon's own documentation or existing release configuration. Users can choose separate implementations when a feature fundamentally differs; the default is shared core code with narrowly scoped adapters.
