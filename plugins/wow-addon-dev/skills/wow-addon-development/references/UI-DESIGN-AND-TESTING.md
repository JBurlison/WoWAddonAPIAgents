# UI mock-ups and UIForever testing

Use this workflow for visible addon UI changes. [UIForever](https://uiforever.com/) is a hosted browser simulator for layout and interaction checks. It supplements the [real-client acceptance checklist](CLIENT-VALIDATION.md); it is not the source of truth for WoW API contracts.

## Choose the design workflow first

Ask whether the user wants a mock-up before production UI implementation, unless the conversation already supplies that choice or an accepted design. Record the answer in the addon task notes. Do not ask again on every file or iteration.

For "Mock-up first", establish the intended task, target clients, screen size/UI scale, key controls and representative states. Create a reviewable static design or a small, disposable Lua/XML prototype with synthetic data. Show layout, labels, interaction flow, and relevant empty/populated/error states; capture the user's feedback and accepted design before applying it to production UI. Prototype fixtures must not become fallback game data in the addon. UIForever runs addon code; it is not a documented prompt-to-UI generator or a general visual authoring tool.

For "Implement directly", continue implementation without inserting another design approval step. Independent source research can proceed while a mock-up choice or design feedback is pending. A non-UI fix does not need this question.

## Carry the design through implementation

Use [visual fidelity](VISUAL-FIDELITY.md) to turn the accepted mock-up into an asset/layout plan and compare it with actual rendered screenshots. Custom artwork behind native interactive controls is an appropriate technique when stock visuals do not match. A native-only approximation, a flat mock-up image with no working controls, or a clean Lua-error panel is not sufficient visual acceptance. Compare a representative panel early, fix material mismatches, and retain both the baseline and implementation evidence.

For a real-client test session, use [Witchcraft MCP and computer use](CONNECTED-CLIENT-TESTING.md) when those capabilities are available. MCP context/error reads, simulator screenshots and computer-use observations answer different questions; keep their results separate.

## Check the simulator's actual target

Availability observed on **2026-10-31** on the [official homepage](https://uiforever.com/#flavors-title):

| Marketplace target | Observed simulator state | Action |
|---|---|---|
| Forever | Available | Open the [Forever simulator](https://uiforever.com/app?flavor=forever). |
| Retail | Temporarily disabled | Record simulator testing as not run; use static checks and the Retail client. |
| Classic progression | Mists of Pandaria Classic listed as coming soon | Record simulator testing as not run; use static checks and the progression client. |

Recheck the live selector before each session; availability changes. Planned Era/Anniversary flavors do not expand this marketplace's supported targets. Never substitute Forever simulation for a Retail or Classic pass.

Use a supported desktop browser. Record the `Developer` panel's build/interface separately from the selected client and pinned source commit. The observed simulator reported **1.60.1.70450 / interface 16001**, while the packaged Forever source ledger is pinned to 1.60.1.70532. A shared interface number does not make those builds identical. If a build is not exposed, record it as unknown; do not alter source pins to match the emulator.

## Run the UI checks

1. Open the matching available flavor and load its baseline UI. Allow initial game assets to load. Use a separate test setup and only the addon, dependencies and optional settings fixtures needed for the task.
2. Under `ADDONS`, use `Choose folder` or `Choose ZIP` to import the project's addon build. Review the detected addons/dependencies before import. Optional `WTF IMPORT` loads settings fixtures; a fresh-settings run should come first. The catalog can help reproduce interactions, but its compatibility results describe the simulator, not actual client acceptance.
3. Set the intended resolution and UI scale. Check at least the user's target layout and a smaller viewport/alternate scale relevant to the addon. Inspect clipping, anchors, text wrapping, layering, tooltips, scrolling, input focus and controls. Use Edit Mode only for frames that actually participate in it.
4. Exercise relevant `Solo`, `Dungeon` and `Raid` states, plus target/focus and character/class changes where the UI depends on them. The `JSON` scenario menu can preserve a reproducible fixture. Simulated combat is useful for display transitions but does not certify secure execution or protected operations.
5. Inspect `Errors`, `Missing APIs` and `Lua Console`; capture the first useful stack trace and reproduction steps. `Missing APIs` identifies simulator gaps, potentially returning stub defaults. Check the pinned WoW contract before changing addon code; a missing emulator implementation is not proof the game API is missing. Do not add production shims merely to silence the simulator.
6. Use `/reload` to check the simulated initialization/settings lifecycle, then repeat the relevant visual states. `Developer` reports load/memory/object data, including estimates; treat these as simulator diagnostics, not measured game performance.
7. Save representative screenshots and compare them with the accepted mock-up using the visual-fidelity guide. Record fixture identity, mismatches, errors and pass/fail/not-run results in the addon project's test notes. Follow with real-client tests for every selected target, including actual persistence, event timing, dependencies, combat lockdown, taint and restricted values.

If browser automation is unavailable, provide these steps and mark execution not run. Do not invent a UIForever CLI, public test API or CI integration. If startup fails, record the visible error and use static/in-game checks; do not bypass browser security controls or claim the addon failed from an emulator startup error.

## Imports, exports and external actions

Use project fixtures or user-selected settings; a personal WTF folder is optional. The [privacy policy](https://uiforever.com/datenschutz) says imported addon/WTF contents remain in browser storage, while usage metadata is transmitted. This is a published policy, not an independent privacy audit or an offline guarantee. The `Report` form sends information to support and can include addon/error details; do not submit a report or publish/share a setup without a user request.

For a requested transfer, inspect the exported ZIP and its instructions before applying it, and back up the destination WTF settings. Settings exports are not a substitute for the addon's release package. The [terms](https://uiforever.com/nutzungsbedingungen) describe catalog packages as simulator copies with audio removed; obtain real game packages from their original source. Action-bar transfer requires the optional companion addon according to the [homepage](https://uiforever.com/#bars-title); installing it is not required for ordinary UI testing.

## Evidence to deliver

Record the addon revision/dependencies, mock-up choice and design reference, selected real client/source pin, simulator URL/date/reported build, browser, scenario/fixture, resolution/UI scale, interactions, screenshots and diagnostics. Keep **design review**, **static validation**, **simulator results** and **in-game acceptance** separate. A useful result is "Forever simulator, reported build X, dungeon fixture Y: layout passed; API Z not emulated; real-client combat/persistence not run" rather than "Forever supported".

The [compatibility page](https://uiforever.com/compat) and current site controls are supplementary evidence. A successful default-UI session or another addon's green catalog entry does not validate the user's addon.
