# Per-client acceptance

Run this checklist for every selected client/build. Record pass/fail/not-run separately for Retail, Forever, and Classic; never extrapolate a Retail pass to the others.

At testing time for Forever, follow the [testing choice](../SKILL.md#verify-and-deliver) and reuse an existing answer. Record the chosen route separately from the user's mock-up choice and design feedback. For UIForever, follow [simulator testing](UI-DESIGN-AND-TESTING.md) with an available matching flavor and record its reported build. Keep unperformed in-game rows below marked not run.

For selected in-game testing, use [connected client testing](CONNECTED-CLIENT-TESTING.md) for Witchcraft context/Lua errors and computer-use inspection where supported, or user reproduction where needed. Verify the actual client and observation freshness. For an accepted mock-up, apply the [visual comparison checks](VISUAL-FIDELITY.md); no-error or functional checks cannot substitute for appearance.

| Check | Acceptance |
|---|---|
| Artifact | ZIP root is the addon folder; every TOC/XML include exists with correct case and load order. |
| Build | Interface number matches the target client's fourth `GetBuildInfo()` result; packaged target matches the running client. |
| First login | No Lua errors with a fresh SavedVariables file; initialization occurs once. |
| Persistence | Settings survive `/reload`, a clean logout/login, and a full client restart; migrations preserve existing user data. Record each result separately. |
| UI | Frames, text, menus, templates, and options work before and after dependency loading. |
| Visual fidelity | Actual client screenshots at the agreed resolution/UI scale match the accepted design's layout, artwork, typography and relevant states. Material differences are fixed or explicitly resolved; evidence retained. |
| Interaction | Hit regions match visible controls; hover/pressed/disabled states, focus, text entry, scrolling and tooltips work. Custom artwork does not obstruct native controls. |
| Controller assessment | Every changed UI element is classified as decorative/passive or interactive, with the applicable controller path, explicit user exclusion or unresolved limitation recorded per client. Follow [controller support](../../wow-controller-support/SKILL.md). |
| Controller acquisition | Start with the window open in mouse mode and no controller ownership. Exercise the effective focus binding, including remapped/unbound cases and an opening button still held; verify acquisition, input consumption and release before broad navigation checks. Follow [focus acquisition](../../wow-controller-support/references/FOCUS-ACQUISITION.md). |
| Controller operation | With the recorded device/input mode, test focus order, activation, back/close and modal return, tabs, scrolling and applicable text entry; focus/action hints remain visible. Recycled or asynchronously replaced controls must reject stale actions, even when a frame or record ID is reused. Reveal an off-screen focused action before activation without moving mouse-mode scroll positions merely to restore remembered focus. |
| Controller lifecycle | Check close/reopen, reload, device loss/reconnect, mouse/keyboard switching, screenshot/native-chat handoff, competing windows and combat transitions where applicable. Held buttons and repeats cannot leak actions or immediately reactivate capture; resume only after neutral input and current ownership checks. Preserve user bindings and valid drafts; reject writes to replaced owners/fields. Record unsupported/not-run checks explicitly. |
| Feature | Auras/spells/bags/talents/events used by the addon return the expected shapes in relevant states. |
| Combat | Enter/leave combat; no protected-action or secret-value errors, taint regressions, or forbidden data inspection. |
| World transitions | Zoning, instance entry/exit, group changes, and login lifecycle remain correct where relevant. |
| Unsupported feature | Explicitly disabled or omitted on the affected target with an accurate user-facing explanation. |

Static checks can inspect syntax, packaging, references, and mocked adapter contracts. Browser simulation can expose layout/interaction problems and simulator-specific API gaps. Neither establishes Blizzard's secure execution, secrets, server state, complete event timing, real persistence or actual performance. Report unavailable simulator and in-game testing separately.

For controller results, distinguish **presentation** (focus outline/prompts), **callback integration** (registered scripts receiving the selected client's native button/stick tokens and payloads), and **physical client operation** (acquisition, consumption and release on the recorded device/build). Calling a normalized navigation method or a preview helper does not exercise the callback boundary. Source inspection establishes a contract to test, not a hardware pass.

For reproducible capability captures and event tests, use [runtime validation](RUNTIME-VALIDATION.md). Record the actual client build, enabled addons, loaded dependencies and scenario with each result. For Forever, apply the [build-scoped identity and defect history](../../wow-client-targets/references/FOREVER.md); earlier beta behavior is not a current pass or failure.
