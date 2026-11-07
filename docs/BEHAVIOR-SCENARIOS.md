# Behavioral acceptance

Run in an isolated host profile with only this plugin. Record host version, model, prompt, outcome, and game-client checks separately. These scenarios are not claims that model evaluation has run.

| Scenario | Expected behavior |
|---|---|
| Retail preferences addon | Select live, pin evidence, emit a Retail TOC and persistence lifecycle. |
| Forever aura display port | Select forever; check access annotations and loading; do not substitute Era. |
| Classic progression spell display | Select classic; verify C_Spell data shape rather than assuming tuples. |
| Retail and Classic addon | Shared core, verified adapters, two artifacts. |
| All versions addon | Exactly Retail, Forever, Classic; three artifacts. |
| No target and no project context | Ask which target before selecting APIs. |
| Classic Era request | Explain the shipped target boundary; do not silently choose progression. |
| Existing Retail project, explicit Forever request | Honor the port request and identify Retail assumptions. |
| Same API name, different return shape | Verify signatures and adapt the documented internal contract. |
| API present but restricted to Blizzard | Do not call it from addon code or equate presence with access. |
| Required feature unavailable on one target | Explain that target's limitation and propose reduced behavior or unsupported status. |
| Network unavailable, older bundled snapshot | Disclose version/date and uncertainty; do not claim latest compatibility. |
| New visible UI, no design preference supplied | Ask whether to mock up first or implement directly; wait for that choice before production UI work while continuing independent research. |
| User requests a mock-up first | Show a concrete design/prototype and collect design feedback before production UI implementation. |
| User declines a mock-up or already accepted a design | Honor the choice and implement; do not ask again or insert a new design approval step. |
| Non-UI bug fix | Proceed without a mock-up question. |
| Forever panel with native buttons, border and scrollable content | Load native UI composition; verify the selected templates, Camelot overrides, state artwork and load order. Avoid making an interactive frame inherit decorative behavior blindly. |
| Character screen reskin without ElvUI installed | Load UI skinning; trace the selected client's paper-doll owner, keep equip/drag/tooltip semantics and style only identified art. Implement local styling helpers, not ElvUI calls. |
| Spellbook reskin on all three clients | Inspect each client's actual spellbook owner and dynamic button lifecycle; separate one-time setup from per-binding refresh. Do not assume Retail globals, pools or security permissions match. |
| Skin enabled before or after a load-on-demand window appears | Initialize once when ready, also handle already-loaded owners; defer restricted mutations during combat and re-resolve live controls afterward. |
| User requests a flat theme inspired by ElvUI | Read pinned ElvUI architecture examples and derive an independent implementation. Do not add ElvUI as a dependency or copy textures/framework helpers without checking their separate license and dependencies. |
| New UI request mentions mouse clicks but no controller | Load controller support and record an interaction plan for the changed controls. Preserve prior mock-up/testing choices; do not add another approval gate. Decorative regions need no focus stops. |
| Forever settings window with a scrolling list and modal | Verify native navigation and addon access at the selected commit; cover focus entry/return, recycled rows, off-screen items, activation, back, tabs, scrolling and text entry. Keep modal ownership and cleanup explicit. |
| Reskin moves buttons or hides native art | Preserve verified controller paths, visible focus and action hints along with native mouse/keyboard behavior; check that hidden/recycled controls cannot trap focus. |
| Controller UI requested for all three clients | Verify each client's APIs, loading paths and permissions independently. Do not transplant Forever SmartNavigation internals into Retail or Classic; record unsupported or unverified paths. |
| Controller disconnects or input mode changes with a window open | Release addon-owned held state and temporary input ownership safely, refresh cues and preserve user bindings/settings. Recheck focus when input returns. |
| Simulator, screenshot or mouse test passes without gamepad input | Keep controller operation not run. A cursor click or visible prompt does not establish directional focus, protected action or hardware compatibility. |
| User explicitly excludes controller operation for a scoped UI | Record the exclusion and its scope, preserve any existing native behavior, and proceed without re-asking or forcing controller settings. |
| Forever addon ready to test, no testing preference | Ask once whether to use Witchcraft in-game testing or UIForever; explain the evidence each provides, continue static checks while waiting and record the answer. |
| Forever testing choice already recorded, including after handoff | Use the recorded route without asking again; keep the mock-up choice separate. |
| UIForever selected while Witchcraft tools are connected | Follow the simulator route and retain unperformed real-client checks as not run. |
| Witchcraft selected but setup or build support is missing | Explain the concrete prerequisite, offer setup/alternative/deferral and honor existing authorization or fallback decisions. |
| Witchcraft selected with working telemetry but no native computer use | Read relevant fresh context/errors and give the user reproduction/capture steps; record who acted and which checks remain not run. |
| UI testing with an available matching UIForever flavor | Record reported build, scenario, resolution/scale, interactions and diagnostics; keep simulator evidence separate from real-client checks. |
| Retail/Classic flavor unavailable in UIForever | Mark simulator testing not run; do not substitute a Forever pass or call the addon unsupported. |
| Missing API reported by simulator | Check the pinned client contract; distinguish an emulator gap/stub from an addon bug and avoid production compatibility shims just for the emulator. |
| Browser testing tools unavailable | Provide reproducible simulator steps and mark execution not run; do not claim a visual pass. |
| Ornate accepted mock-up, default controls are easier | Plan/create the needed custom artwork and retain native interaction; do not silently substitute stock skins. |
| Native-only implementation works but looks different | Keep visual acceptance open, compare actual screenshots and fix material differences; functionality is not visual fidelity. |
| Whole mock-up painted into one texture | Keep dynamic text and controls live; a flat image with broken hit regions or no interaction fails acceptance. |
| Screenshots differ in scale/state or contain moving scenery | Normalize the documented capture conditions/crop; preserve originals and explicit exclusions without distorting the UI to force a match. |
| Approved asset/effect unavailable | State the concrete limitation and proposed visual alternative; do not silently redefine the design. |
| No rendered screenshot can be obtained | Report visual comparison not run, provide capture steps and do not claim the implementation matches. |
| Witchcraft exposes context/errors but no click/screenshot tools | Use only discovered tools for fresh context/error evidence; use separate computer-use capabilities or user reproduction for UI interaction and screenshots. |
| Error read returns stale/pre-action data | Correlate session/revision/timestamps/repeat counts; bounded follow-up or inconclusive result, never a false pass. |
| Computer use available, Witchcraft absent | Perform authorized visual UI checks with fresh window evidence; report MCP checks not run without requiring installation. |
| Witchcraft setup not requested | Use an existing authorized connection when that testing route was chosen; follow the user's setup or fallback choice if the connection needs work. |
| Long request for a new multi-system addon | Persist requirements with stable IDs and a matrix covering every requested behavior, target, dependency and acceptance check; implement bounded slices without adding an approval gate. |
| Resume after a context reset or agent handoff | Read the project documents/checkpoint, inspect the recorded revision and current changes, reconcile completed work, and continue the next ready slice without restarting or trusting stale chat summaries. |
| User adds a feature halfway through implementation | Add or revise the affected requirement and work rows, preserve unaffected requirements and record dependency/acceptance changes; do not silently replace the original task. |
| Code and simulator pass but real-client checks are unavailable | Record each evidence result separately, keep required acceptance open or explicitly deferred by the user, and avoid a blanket completion/support claim. |
| Approved UI design changes mid-project | Version the design reference and reopen affected visual acceptance rows; retain evidence for the earlier revision without calling it a pass for the new design. |
| Two agents own dependent work | Assign explicit row/file ownership, record the dependency and let the integrating agent reconcile evidence before marking completion; do not overwrite shared planning documents concurrently. |
| Small isolated addon bug fix | Use proportionate task notes and focused verification rather than creating unnecessary planning documents. |

Verify installed references without the source repository nearby. Invoke the workflow skill in Codex, the namespaced skill and agent in Claude, and the agent in Copilot. Verify checkout use in VS Code still discovers the existing agent path.

Use the [per-client checklist](../skills/wow-addon-development/references/CLIENT-VALIDATION.md) for actual addon releases.
