# [Feature or addon] requirements

- Project/repository: [location]
- Updated: [date/time and author]
- Implementation matrix: [relative path]
- Original request: [durable reference and relevant wording]
- Goal: [observable user outcome]
- Scope boundaries: [explicit exclusions and existing behavior to preserve]

## Requirements

| ID | Required behavior or constraint | Origin and source | Priority | Targets | Observable acceptance criteria | State |
|---|---|---|---|---|---|---|
| REQ-001 | [one requirement] | [User: quoted instruction/reference, or Assumption: rationale] | [user priority or labeled implementation order] | [retail / forever / classic / selected combination] | [steps or state and expected result] | [active / proposed / superseded / withdrawn] |

## Target and API evidence

| Target | Intended client/build/interface | Source commit and evidence | Related REQ IDs | Loading/access/runtime uncertainty |
|---|---|---|---|---|
| [target] | [values or unknown] | [pinned source links or project evidence path] | REQ-001 | [unknowns and required probe] |

## UI and accepted design

- Mock-up choice and source: [requested / declined / existing accepted design / pending / no UI change; source]
- Accepted design: [project path or URL, exact revision, acceptance source; or none]
- Relevant REQ IDs: [IDs]
- Layout, assets and states to preserve: [references]
- Intended resolution/UI scale and interaction criteria: [values]

## Options-menu integration and localization (baseline requirements)

- Options discovery: [built-in addon settings category/subcategories and shortcuts; or no configurable behavior / explicit user exclusion with reason]
- Settings lifecycle: [account/character/profile scope, defaults/migrations, immediate/Apply/reload behavior, reset scope and stable IDs]
- Locale architecture: [base catalog, override/consumer file order, fallback policy and internal IDs to preserve]
- Translation coverage: [locales; complete/partial/unreviewed; context and natural-language terminology/meaning review; remaining work]
- Acceptance REQ IDs: [menu discovery, persistence/defaults/profile switching, missing-key fallback, formatting, natural phrasing and localized layout; per-client results belong in the matrix]

## Controller interaction assessment (required for UI changes)

| UI element or control group | Role | Controller path and visible cues | Target evidence / gaps | Acceptance or explicit user exclusion |
|---|---|---|---|---|
| [element/group] | [interactive / decorative / passive] | [focus entry/order/return, primary/back, tabs/scroll/text entry as applicable, focus/action hints; or not applicable with reason] | [client/build, verified native owner/contracts, unresolved behavior] | [reproducible checks or user's exclusion and source] |

- Input modes/devices to exercise: [actual available devices/routes; hardware or host limitations]
- Bindings/settings to preserve: [existing user configuration and explicitly requested changes only]

## Testing preference

- Route and source: [Witchcraft in-game / UIForever simulator / another explicit choice / pending until testing is needed; user answer or reference]
- Setup or fallback decision: [existing authorization, agreed alternative, or pending]
- Remaining real-client checks: [acceptance criteria requiring a client or user reproduction]
- Controller checks: [device/input route, pending actions/focus transitions, not-run reasons; keep separate from mouse/keyboard results]

## Open questions and assumptions

| ID | Question or assumption | Related REQ IDs | Impact / independent work available | Resolution and source |
|---|---|---|---|---|
| Q-001 | [unresolved point] | REQ-001 | [affected decision and work that can continue] | [pending or answer/reference] |

## Decisions and scope changes

| ID / date | Source | Decision or change | Affected REQ IDs | Consequence / successor / checks to repeat |
|---|---|---|---|---|
| DEC-001 / [date] | [user instruction or labeled implementation decision] | [decision] | REQ-001 | [effect] |

## Completion criteria

[Conditions required for delivery; explicitly identify acceptance that needs a real client or user observation. Results belong in the implementation matrix.]
