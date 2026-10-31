---
name: wow-api-lua-environment
description: Look up the WoW Lua 5.1 runtime environment, restrictions, secure
  execution, taint system, addon security model, timers, hooks, frame scripting,
  logging, and restricted actions. Covers hooksecurefunc, C_Timer,
  securecallfunction, issecurevariable, taint propagation, combat lockdown,
  protected frames, InCombatLockdown, C_RestrictedActions, C_Log, and the
  FrameScript sandbox. Use when working with Lua restrictions, secure code,
  taint, timers, hooks, addon security, debugging, or the WoW Lua sandbox.
  Select Retail, Forever, or Classic with wow-client-targets before using
  historical listings.
---

# api lua environment

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify Lua extensions, taint, secure execution, secret-value access and protected operations for the selected build. Never transfer a blanket Retail prohibition or permission to another client.

Start security work with [reviewed access contracts](references/CURRENT-CONTRACTS.md). They separate variable taint, value access and protected operations, correct the historical `issecurevariable` boolean example, and identify evidence still requiring a client probe.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
