# Per-client acceptance

Run this checklist for every selected client/build. Record pass/fail/not-run separately for Retail, Forever, and Classic; never extrapolate a Retail pass to the others.

Before game-client acceptance, use [UI design and UIForever testing](UI-DESIGN-AND-TESTING.md) for visible UI changes. Record the user's mock-up choice, design feedback and simulator results separately. Only use an available matching simulator flavor; its reported build can differ from the pinned source and intended client. A simulator pass does not complete any in-game row below.

Where supported, use [connected client testing](CONNECTED-CLIENT-TESTING.md) for Witchcraft context/Lua errors and computer-use inspection. Verify the actual client and observation freshness. For an accepted mock-up, apply the [visual comparison checks](VISUAL-FIDELITY.md); no-error or functional checks cannot substitute for appearance.

| Check | Acceptance |
|---|---|
| Artifact | ZIP root is the addon folder; every TOC/XML include exists with correct case and load order. |
| Build | Interface number matches the target client's fourth `GetBuildInfo()` result; packaged target matches the running client. |
| First login | No Lua errors with a fresh SavedVariables file; initialization occurs once. |
| Persistence | Settings survive `/reload`, a clean logout/login, and a full client restart; migrations preserve existing user data. Record each result separately. |
| UI | Frames, text, menus, templates, and options work before and after dependency loading. |
| Visual fidelity | Actual client screenshots at the agreed resolution/UI scale match the accepted design's layout, artwork, typography and relevant states. Material differences are fixed or explicitly resolved; evidence retained. |
| Interaction | Hit regions match visible controls; hover/pressed/disabled states, focus, text entry, scrolling and tooltips work. Custom artwork does not obstruct native controls. |
| Feature | Auras/spells/bags/talents/events used by the addon return the expected shapes in relevant states. |
| Combat | Enter/leave combat; no protected-action or secret-value errors, taint regressions, or forbidden data inspection. |
| World transitions | Zoning, instance entry/exit, group changes, and login lifecycle remain correct where relevant. |
| Unsupported feature | Explicitly disabled or omitted on the affected target with an accurate user-facing explanation. |

Static checks can inspect syntax, packaging, references, and mocked adapter contracts. Browser simulation can expose layout/interaction problems and simulator-specific API gaps. Neither establishes Blizzard's secure execution, secrets, server state, complete event timing, real persistence or actual performance. Report unavailable simulator and in-game testing separately.

For reproducible capability captures and event tests, use [runtime validation](RUNTIME-VALIDATION.md). Record the actual client build, enabled addons, loaded dependencies and scenario with each result. For Forever, apply the [build-scoped identity and defect history](../../wow-client-targets/references/FOREVER.md); earlier beta behavior is not a current pass or failure.
