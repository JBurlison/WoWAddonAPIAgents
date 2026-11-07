# [Feature or addon] implementation matrix

- Requirements: [relative path]
- Integration owner: [one person or agent]
- Updated: [date/time]
- Evidence directory: [project-relative path]

## Implementation coverage

| Row | REQ IDs | Target(s) | Slice / observable result | Dependencies / order | Owner | Implementation files | Status | Validation IDs / remaining work |
|---|---|---|---|---|---|---|---|---|
| IMP-001 | REQ-001 | [targets] | S01: [bounded behavior] | [row IDs or none] | [owner] | [paths] | planned | [V-001; outstanding work] |

Statuses: `planned`, `in progress`, `implemented`, `verified`, `blocked`, `deferred`, `superseded`. `Implemented` does not mean acceptance passed; `verified` requires evidence for that row's criteria and selected targets.

## Validation evidence

| ID | REQ IDs / slice | Target and observed build | Mode | Exact addon revision / dirty-state reference | Procedure / fixture and expected result | Observed result / evidence path | Status |
|---|---|---|---|---|---|---|---|
| V-001 | REQ-001 / S01 | [target; build or unknown] | [design/visual comparison / static / simulator / in-game] | [commit and relevant changes] | [reproducible check] | [actual result or reason not run] | not run |

Validation statuses: `pass`, `fail`, `not run`, `not applicable` (with reason), `stale`. For simulator results, identify the simulator/build separately from the intended game build. A visual comparison records its rendering environment and accepted-design revision.

## Blocked, deferred or replaced work

| REQ / row IDs | State | Cause or scope decision / source | Next action and owner | Effect on delivery |
|---|---|---|---|---|
| [IDs or none] | [state] | [specific blocker, explicit deferral, or successor] | [action / owner] | [remaining limitation] |

## Resume checkpoint

- Updated by / at: [owner, date/time]
- Repository / branch: [location and branch]
- Exact HEAD revision: [full commit SHA; for a new repository, state no commit]
- Working tree: [clean, or staged/unstaged/untracked paths and relevant change description; scoped diff/artifact reference if needed to reproduce the state]
- Last completed slice: [slice and implementation row IDs]
- Last verified state: [validation IDs, target/build, tested revision and evidence paths]
- Current slice and pending edits: [row IDs, owner, files, partial work]
- Next executable action: [concrete command or edit/test step, working directory and prerequisites]
- Open questions / blockers: [Q IDs and blocked rows; what can continue]
- Decisions to retain: [DEC IDs and concise effects]
- Testing choice: [route and user answer/source; setup or fallback decision; pending checks]
- Controller assessment: [UI requirement IDs, action/focus plan, device/input mode tested, explicit exclusions, per-client gaps and pending checks]
- Read next: [ordered, short list of requirement sections, code files and evidence paths]
- Drift since verification: [changed code, source pins, targets, design or none; validation IDs made stale]

## Coverage reconciliation

- Requirements missing matrix rows: [IDs or none]
- Implemented requirements awaiting acceptance: [IDs and checks]
- Unresolved target-specific gaps: [target, IDs and limitation]
- Remaining requested work: [IDs, or none only after reconciliation]
