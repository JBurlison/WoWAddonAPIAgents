---
name: wow-api-calendar-events
description: Look up WoW Calendar and Event Scheduler APIs. Covers C_Calendar
  (event creation, editing, invites, holidays, raid resets, filtered events,
  date navigation, guild events, community events, texture lookups) and
  C_EventScheduler (scheduled event system). Use when working with the in-game
  calendar, creating events, managing invites, displaying holidays, or
  scheduling guild/community activities. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# api calendar events

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify calendar availability, event types, invitation permissions, date/time fields, and event payloads. Separate local UI state from server-backed operations.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the baseline, then verify the relevant definitions upstream.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
