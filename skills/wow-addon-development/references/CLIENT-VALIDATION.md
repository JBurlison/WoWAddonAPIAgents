# Per-client acceptance

Run this checklist for every selected client/build. Record pass/fail/not-run separately for Retail, Forever, and Classic; never extrapolate a Retail pass to the others.

| Check | Acceptance |
|---|---|
| Artifact | ZIP root is the addon folder; every TOC/XML include exists with correct case and load order. |
| Build | Interface number matches the target client's fourth `GetBuildInfo()` result; packaged target matches the running client. |
| First login | No Lua errors with a fresh SavedVariables file; initialization occurs once. |
| Persistence | Settings survive `/reload`, a clean logout/login, and a full client restart; migrations preserve existing user data. Record each result separately. |
| UI | Frames, text, menus, templates, and options work before and after dependency loading. |
| Feature | Auras/spells/bags/talents/events used by the addon return the expected shapes in relevant states. |
| Combat | Enter/leave combat; no protected-action or secret-value errors, taint regressions, or forbidden data inspection. |
| World transitions | Zoning, instance entry/exit, group changes, and login lifecycle remain correct where relevant. |
| Unsupported feature | Explicitly disabled or omitted on the affected target with an accurate user-facing explanation. |

Static checks can inspect syntax, packaging, references, and mocked adapter contracts. They cannot emulate Blizzard's secure execution, secrets, server state, or complete event timing. Report unavailable in-game testing plainly.

For reproducible capability captures and event tests, use [runtime validation](RUNTIME-VALIDATION.md). Record the actual client build, enabled addons, loaded dependencies and scenario with each result. For Forever, apply the [build-scoped identity and defect history](../../wow-client-targets/references/FOREVER.md); earlier beta behavior is not a current pass or failure.
