# Maintaining the index

Keep source skills under skills. Add domain names to the index and relevant namespace/category lookup tables. A listed domain indicates that documentation exists, not that every API is available on every client.

When upstream changes, resolve the selected branch to a commit and review affected definitions and UI loading paths. Record target-specific source links, signatures, event payloads and access restrictions. Preserve old Retail notes as historical; do not remove a function required by another supported target.

Advance target metadata only after complete review. Regenerate the marketplace package with npm run build, then run npm run check and npm test. The updater proposes human-reviewed PRs; it does not merge them.
