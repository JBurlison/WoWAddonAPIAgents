# Maintaining the source ledger and routing

The maintained sources are repository `skills/`, `config/api-owners.json` and the target registry. Never edit a cached installation to update its references. Generated JSON, the namespace/domain routing tables and alphabetical event catalogues must be rebuilt together.

1. Review the selected target's upstream change, pin its commit and update the target registry only after source review.
2. Acquire exactly those commits into ignored `.cache/api-audit/{retail,forever,classic}`. Do not execute upstream Lua.
3. Assign every new source file and namespace/global/object/data system an owner in `config/api-owners.json`. Preserve front-end, internal, platform and mixed-context classifications. New entries fail generation until explicitly assigned; a silent miscellaneous fallback is prohibited.
4. Run `node scripts/generate-api-references.mjs`. This extracts schemas and updates all linked navigation. Advance the build summary in [CURRENT-REFERENCES.md](CURRENT-REFERENCES.md).
5. Run `node scripts/generate-api-references.mjs --check` for offline hashes, counts, ownership, source provenance, symbol routing and semantic contracts. With source checkouts available, `--verify-source` also recomputes the artifacts from upstream.
6. Run the repository package build, normal checks and tests. Update affected handwritten semantic guides and preserve each target's distinct payloads/restrictions.

The ledger proves extraction coverage of generated definitions, not successful addon access or complete coverage of handwritten FrameXML, XML, CVars and macros. In-game validation remains separately recorded. If access fails, retain the prior pinned evidence and report the unresolved target; do not advance a snapshot or turn absence into removal.
