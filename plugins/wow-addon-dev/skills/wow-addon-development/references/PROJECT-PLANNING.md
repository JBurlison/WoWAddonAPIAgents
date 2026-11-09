# Persistent plans for addon projects

Use this workflow for new addons and substantial changes with several features, targets, dependencies or work sessions. Keep the scope, implementation state and evidence in the **user's addon repository** so another agent can resume without the conversation. For a small, isolated fix, a short existing task note with the requirement, changed files and validation result is enough; do not create two documents merely to satisfy a format.

## Establish the project record

Reuse the project's requirements, issue specifications and implementation tracker when they can hold the information below. Otherwise copy the [requirements template](../assets/REQUIREMENTS.template.md) and [implementation matrix template](../assets/IMPLEMENTATION-MATRIX.template.md) to a feature directory such as `docs/plans/<feature>/`. Populate them for the actual request; keep installed marketplace files read-only. Repository conventions and explicit user preferences take precedence over the suggested filenames.

Give every required behavior and constraint a stable `REQ-` ID, including compatibility, persistence and visual requirements where requested. Capture the relevant user wording or a durable source reference, distinguish user requirements from implementation assumptions, and write observable acceptance criteria. Record all requested features before choosing the first slice. Priority determines order, not permission to omit lower-priority requested work. Unresolved questions remain visible; they do not erase requirements or silently become decisions.

Record selected clients, source commits/builds and relevant API/loading evidence using [client targets](../../wow-client-targets/SKILL.md). Preserve unknown availability. For UI work, record the existing [mock-up choice](UI-DESIGN-AND-TESTING.md), accepted design revision, assets and representative states; link durable project copies where available. A design acceptance does not establish functional or in-game acceptance.

When the addon reaches testing, record the [Forever testing choice](../SKILL.md#verify-and-deliver), its source, any setup authorization and agreed fallback in the requirements and resume checkpoint. Reuse that choice on subsequent slices and after resumption. An unresolved testing preference can remain pending while independent implementation and static checks proceed.

For every UI change, record the required [controller assessment](../../wow-controller-support/SKILL.md) by element or coherent control group: interactive/decorative role, controller actions/focus path, per-client evidence and unresolved checks. Connect these interaction criteria to requirement and validation rows. Carry explicit user exclusions and controller test availability through the resume checkpoint; lack of hardware does not remove the assessment or justify a support claim.

Creating or updating the plan is part of the authorized work, not a new approval gate. Continue independent work while a material clarification or the existing UI choice is pending. Honor prior answers and authorization; do not request approval of each document, slice or checkpoint.

## Implement bounded slices

For new addons and relevant changes, include baseline [options-menu integration](../../wow-api-settings-system/references/ADDON-OPTIONS.md) and [localization](LOCALIZATION.md) requirements and acceptance rows. Record category discovery, preference scope/defaults/migrations, catalog loading/fallback, declared locale coverage, natural phrasing/meaning review and localized layout. Preserve stable internal IDs and existing settings across language/profile changes. Record explicit exclusions or no configurable behavior with a reason; an English fallback or automated placeholder check is not a translation-quality pass.

Map every `REQ-` ID to matrix rows, including blocked, deferred or superseded requirements. Split broad requirements into rows by target or acceptance case when needed. Each row identifies a bounded vertical slice, dependencies/order, one owner, affected files and validation evidence. A useful slice completes one observable behavior through its data, state and UI layers, small enough to inspect and verify before expanding.

Before a slice, read the relevant requirements, checkpoint, dependencies and code. Implement it, run the checks appropriate to the changed behavior, then reconcile its files and results in the matrix. Keep implementation status separate from verification: written code may be implemented while client acceptance remains not run. Record validation by target and build, with separate design/visual comparison, static, simulator and in-game results. Follow [client validation](CLIENT-VALIDATION.md); a simulator or static pass never fills an in-game result.

If a blocker prevents a slice, record the concrete cause, affected IDs, next action and owner; continue independent slices where useful. Defer a requested feature only with an explicit scope decision or an accurately reported unresolved limitation. Record the reason and source instead of dropping its row or treating deferral as completion.

For parallel agents, assign disjoint implementation files and requirement rows where practical. Name one integration owner to merge results and update the shared requirements/matrix/checkpoint; other agents return their changed files, evidence and remaining issues to that owner. A reported subtask completion is not evidence that all parent requirements are fulfilled.

## Reconcile changes and resume

When the user adds or changes a requirement, update its source and acceptance criteria, the affected matrix rows, dependencies and checks. Keep IDs stable; add IDs for new requirements and mark replaced ones with a successor and decision reference. Preserve earlier scope unless the user changes it. Invalidate prior verification when a code, target, API pin or accepted-design change affects what it proved.

Update the matrix checkpoint after each completed slice and before handoff or interruption: exact repository revision and any uncommitted changes, last verified state, next executable action, open questions, decisions and a short read list. Keep evidence and task-critical decisions in files, not solely in agent messages. Do not commit user changes merely to create a checkpoint; identify the dirty state or retain a scoped diff/artifact reference when needed to reproduce it.

On resume, read those files first, compare the checkpoint with the actual revision and working tree, and reconcile drift before trusting a pass or continuing. Execute the recorded next action once its dependencies still hold. This file-based handoff works with available host workflows, including Ultracode or Hydrafusion; it assumes no particular memory, orchestration or tool integration.

Before delivery, reconcile every active requirement against its implementation and target-specific evidence. Report unfinished, blocked, deferred and not-run work explicitly. A condensed final answer can point to the maintained documents, but neither a summary nor a completed slice substitutes for the full requirement check.
