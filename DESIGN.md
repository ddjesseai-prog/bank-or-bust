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

## Reward schedule

_TBD_

## Progression & retention

_TBD_

## Platform & scope

_TBD_

## Decision log

| # | Decision | Proposed (turn) | Promoted (turn) |
|---|---|---|---|
| 1 | Core bust curve `bust(n) = min(2 + 3*(n-1), 45)%` | Turn 1 (friend-1) | Turn 3 (jesse-claude) |
