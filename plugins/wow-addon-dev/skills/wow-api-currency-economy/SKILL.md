---
name: wow-api-currency-economy
description: Look up WoW Currency, Auction House, Token, Store, Trading Post,
  Black Market, Mail, and Player Trading APIs. Covers C_CurrencyInfo (currency
  data, tracking, backpack), Auction House (full
  listing/bidding/buying/selling/search/commodity), C_WowTokenPublic (WoW Token
  market), AccountStore (in-game shop), CatalogShop, C_PerksProgram (Trading
  Post — Trader's Tender), BlackMarket (BMAH), TradeInfo (player trading),
  MailInfo (mailbox), and related events. Use when working with currencies,
  auction house UI, WoW Tokens, the in-game store, Trading Post, black market,
  mail, or player-to-player trading. Select Retail, Forever, or Classic with
  wow-client-targets before using historical listings.
---

# api currency economy

Use for any selected combination of Retail, Forever, and Classic progression. First resolve the target and pinned source with [wow-client-targets](../wow-client-targets/SKILL.md).

## Target-specific decisions

Verify currency IDs, auction-house API generations, token/store availability, result structures, and asynchronous request events. Do not assume Retail auction search behavior on other clients.

Read the relevant row in [compatibility guidance](../wow-client-targets/references/COMPATIBILITY.md). Verify only the APIs needed for this task, using commit-pinned definitions and loaded client code. Missing evidence means unknown, not supported or removed. When offline, disclose the snapshot version/date and unresolved behavior.

## Detailed lookup material

Use the [pinned source schemas](references/generated/README.md) for complete generated contracts in this domain, including typed arguments, returns, event payloads and restrictions. Query only the needed symbols. Source declarations leave loading, runtime behavior and addon permission unresolved unless separately verified.

The [historical Retail baseline](references/RETAIL-BASELINE.md) retains the original API listings and examples. It is a research aid, not current or cross-client verification. Open only relevant supporting references:

- Start with the pinned source schemas; use the baseline for historical context and verify handwritten helpers separately.

For implementation and release validation, use [wow-addon-development](../wow-addon-development/SKILL.md).
