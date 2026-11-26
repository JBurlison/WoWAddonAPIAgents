# Current source schemas and narrow lookup

The packaged ledger contains every Function, Event, ScriptObject method, Structure, Enumeration, CallbackType, Constants, Precondition and Secret definition in the pinned generated source directories. Every record has an owner, target/build context, source file and line, original system metadata, complete nested fields, defaults, nilability and security annotations. Upstream prose is not copied; open the source link for its explanation. This is a source declaration ledger, not certification that every entry loads or is available to addons.

| Target | Build | Declarations | Functions / events / object methods |
|---|---|---:|---|
| Retail | 12.1.5.70961 | 9,981 | 4,970 / 1,784 / 1,470 |
| Forever | 1.60.1.71037 | 10,260 | 5,147 / 1,816 / 1,477 |
| Classic progression | 5.5.4.71060 | 7,435 | 3,231 / 1,483 / 1,360 |

The [manifest](generated/manifest.json) pins source commits and hashes every generated chunk and navigation artifact. Full file/group provenance lives in [provenance.json](generated/provenance.json), and the deduplicated index lives in [symbols.json](generated/symbols.json). The [namespace routing](NAMESPACE-LOOKUP.md) and [domain routing](DOMAIN-SKILLS.md) cover every generated system, including data-only files and global/object systems.

## Query only the needed contract

With Node.js 18+, run the package-local [query script](../scripts/query.mjs). Paths below are relative to the installed `wow-api-index` skill directory; substitute its actual absolute path when invoking a tool. Flags can appear in any position.

```sh
node scripts/query.mjs forever C_Spell.GetSpellInfo --compact --resolve-types
node scripts/query.mjs all SPELL_UPDATE_COOLDOWN --kind event --compact --diff
node scripts/query.mjs all C_Spell --diff --only-diffs --compact --limit 10
node scripts/query.mjs forever C_SwingTimer --full
node scripts/query.mjs all AuraData --kind structure
node scripts/query.mjs forever Enum.PlayerSwingType.MainHand --compact
node scripts/query.mjs forever C_Housing --list --limit 10 --offset 0
node scripts/query.mjs classic --domain wow-api-professions --kind function --list
node scripts/query.mjs forever --secret --domain wow-api-combat --list
node scripts/query.mjs forever --callback --list
```

Exact symbol/type matches (case-insensitive) return full schemas. Multi-match queries are ranked (exact namespace/method boundaries first, then prefix, then multi-token/substring; ScriptObject queries such as `Frame:SetAlpha` and `SimpleFrame:SetAlpha` also match `SimpleFrameAPI:SetAlpha`) and return summaries unless `--full`, `--compact`, `--diff`, or `--resolve-types` is passed. `--limit` accepts 1–100 and `--offset` paginates past 100. Use `--compact` for token-efficient signatures, `--diff` (requires `all`, cannot be combined with `--list`) with optional `--only-diffs` to highlight cross-target deltas, `--resolve-types` to include referenced structures/enums/callbacks, and `--secret` / `--restricted` / `--callback` / `--environment SecureOnly` to filter security and callback annotations. Enum queries (`Enum.*`) and constant queries (`Constants.*`) automatically scope by kind and support `Enum.Type.Member` lookups.

Without Node.js, choose a domain in the routing tables (`references/domains/<domain>/generated/` for consolidated domains, or `../../<skill>/references/generated/` for standalone skills) and open its `catalog.json`. Each declaration occupies one line with its `declaration` schema and per-target `targets.<id>.file`/line metadata. Search by exact quoted `symbol`, then inspect `declaration` and any named argument/return structures. Do not read whole catalogs for a narrow addon task.

## Schema and evidence rules

- `catalog.json` deduplicates declarations that are identical across targets (`schemaVersion: 3`), hoisting `evidence` and `systems` metadata to the file header while preserving per-target `{ file, line, system }` mappings.
- `declaration` preserves every generated field except `Documentation` prose, including nested arrays, structure fields, enum values, callback signatures, defaults and security annotations. `Arguments`, `Returns` and `Payload` retain source order.
- `luaExpression` represents an unevaluated Lua expression such as an enum reference. `luaStringBody` preserves a string containing Lua escapes without interpreting it. Empty Lua tables become JSON arrays; a mixed table uses `luaFields` and `luaValues`.
- `systems[key]` records the original `parent` system and section. A function's explicit `Namespace = ""` exports a global; a nonempty override uses that namespace. The effective name and original system are both retained.
- `evidence.declaration` is `source-declared`; `loadConditions`, `runtime` and `addonAccess` are `unknown`. A curated guide may add separately cited evidence, but must not silently upgrade this inventory into tested compatibility.
- `classification` distinguishes client systems, front-end/Glue, mixed context, internal/restricted, platform-specific and SecureOnly definitions. `Environment = All` is not an addon permission flag. `CallbackEvent = true` is not a frame-event subscription.
- A source miss is unknown, not proof of removal. Loaded FrameXML globals, mixins, internal callbacks, XML/template loading, macro grammar, CVars and runtime-only exports need their separate references and client tests.

## Completion and maintenance

The extraction accounts for every supported definition table and rejects unmatched tables, duplicate callable names, missing owners and target-commit drift. Offline semantic validation checks hashes, counts, owner coverage, symbol index consistency, source-file inventories and selected signature/restriction/payload contracts. It does not substitute for running the target client.

Repository maintainers update `config/api-owners.json` for newly encountered systems, build with `node scripts/generate-api-references.mjs`, and run `node scripts/generate-api-references.mjs --check`. `--verify-source` additionally recomputes all outputs from exact pinned source checkouts. Update this build summary when advancing the ledger; never hand-edit generated JSON or routing tables.
