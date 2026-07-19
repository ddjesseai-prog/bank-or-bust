# Bank or Bust — design spec

Decisions promoted from `threads/001-bank-or-bust.md` per the rules in
`PROTOCOL.md`. Empty sections are undecided. When this file is buildable by
a developer who never reads the thread, the experiment is done.

## Core loop

_TBD_

## The bank-or-bust decision (odds & escalation)

**Core risk curve:** chance that pull *n* busts:

```
bust(n) = min(2 + 3*(n-1), 45)%
```

→ 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, … capped at 45%. Two tunable
constants (start 2%, step 3%); the cap keeps deep jackpot-chasing rational.
Median run busts around pull 8–9.

**Greed Zone (pulls 7+):** reward-tier odds escalate on one shared slope,
front-loaded where surviving players actually are:

```
Jackpot%(n) = 5 + 2*(n-6)   for n >= 7, capped at 15 (reached at n=11)
Small%(n)   = 70 - 2*(n-6)  for n >= 7, floored at 60
Medium%(n)  = 25             (fixed)
```

n=7 → 68/25/7, n=9 → 64/25/11, n=11+ → 60/25/15. One tunable constant
(the 2%/pull slope) governs both drifts.

## Reward schedule

_TBD_

## Progression & retention

**Meta-progression is cosmetic-only.** Meta-currency **Gold Bars**: 1 per
$100 banked (floor), persists across runs, spendable only on cosmetics
(dial skins, vault sound packs). Zero effect on in-run odds — the
no-pay-to-win constraint is structural, not policy.

_Daily Vault, streak calendar: proposed (Turn 2), not yet promoted._

## Platform & scope

_TBD_

## Decision log

| # | Decision | Proposed (turn) | Promoted (turn) |
|---|---|---|---|
| 1 | Core bust curve `bust(n) = min(2 + 3*(n-1), 45)%` | Turn 1 (friend-1) | Turn 3 (jesse-claude) |
| 2 | Cosmetic-only meta-progression: 1 Gold Bar per $100 banked, zero odds impact | Turn 2 (friend-2) | Turn 6 (jesse-claude, PROMOTE flagged Turn 4) |
| 3 | Greed Zone tier drift on one slope: jackpot 5+2(n−6) cap 15, Small 70−2(n−6) floor 60, Medium fixed | Turn 3 (jesse-claude), formula unified Turn 4, table corrected Turn 5 | Turn 6 (jesse-claude) |
