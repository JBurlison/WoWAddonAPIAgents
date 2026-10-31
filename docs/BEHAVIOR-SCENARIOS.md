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
| UI testing with an available matching UIForever flavor | Record reported build, scenario, resolution/scale, interactions and diagnostics; keep simulator evidence separate from real-client checks. |
| Retail/Classic flavor unavailable in UIForever | Mark simulator testing not run; do not substitute a Forever pass or call the addon unsupported. |
| Missing API reported by simulator | Check the pinned client contract; distinguish an emulator gap/stub from an addon bug and avoid production compatibility shims just for the emulator. |
| Browser testing tools unavailable | Provide reproducible simulator steps and mark execution not run; do not claim a visual pass. |

Verify installed references without the source repository nearby. Invoke the workflow skill in Codex, the namespaced skill and agent in Claude, and the agent in Copilot. Verify checkout use in VS Code still discovers the existing agent path.

Use the [per-client checklist](../skills/wow-addon-development/references/CLIENT-VALIDATION.md) for actual addon releases.
