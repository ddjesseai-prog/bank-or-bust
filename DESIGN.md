# Bank or Bust — design spec

**STATUS: CLOSED** — spec ratified by all three models (Turns 9–12,
Issue #1). This file is buildable without reading the thread.

Decisions promoted from Issue #1 per the rules in `PROTOCOL.md`.

## Core loop

**Theme: Vault Run** — cracking a bank vault one dial-pull at a time.

**Micro (one run):**
1. Run opens, pot = $0.
2. Tap **PULL**: dial-spin anticipation 1.2s (stretching to 1.5s in the
   mid band, see feel ladder) → reward roll adds to pot → bust roll
   checked → 0.4s reveal. ~1.6s per pull.
3. After each surviving pull, ~1s window: **PULL** again or **BANK**
   (locks pot into score, ends run).
4. Bust → 0.8s alarm beat, run ends, pot lost.
5. Typical run 10–18 pulls ≈ 20–35s; deep jackpot chases run longer.

**Macro (session):**
- **New Run** is free, unlimited — no stamina/energy gating, ever.
  Retention is the loop, not scarcity.
- Comedown beat auto-advances in ≤2s (tap to skip) on both branches;
  bust→retry is ≤1.5s with no interstitials.
- Session is freeform, no forced exit screens. A client-side-only
  "banked this session" counter is the sole persistent on-screen state.

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

**Feel ladder** (keyed to bust(n); one heartbeat curve end to end, the
amber pre-tell is a color-only cue riding it — never a second audio ramp):
- **bust ≤ 11% (pulls 1–4):** clean spin, soft click on reward, no
  haptics.
- **bust 14–23% (pulls 5–8):** dial drags — anticipation 1.2s→1.5s
  across the band; heartbeat layer 60→90bpm mapped linearly to bust%;
  one light haptic tick per reveal. Pulls 7–8: dial glow shifts amber
  (visual only) as the Greed Zone economics go live.
- **bust ≥ 26% (pull 9+):** red warning ring; heartbeat 90→140bpm;
  vignette closes 2%/pull; double haptic per reveal; BANK button grows
  8%/pull — the safe choice literally gets bigger as risk rises.
- **Caps:** BANK-button growth (+80%) and vignette closure (20%) both
  cap at n=16, the same pull where bust(n) caps — one shared boundary,
  no new constants.

## Reward schedule

**Tiers per pull** (base weights; Greed Zone drift above applies n≥7):
- Small 70%: +$(10 + 2n)
- Medium 25%: +$(25 + 5n)
- Jackpot 5%: +$(60 + 10n), advances the streak counter

**Near-miss:** bust roll landing within 5 points below that pull's
threshold without busting fires a "close call" sting + screen shake;
amplitude doubles in the red band (pull 9+).

**Streaks** (consecutive jackpot pulls within one run; any non-jackpot
resets to 0; every run starts at 0):
- Streak 2: pot × 1.10 at the moment the second consecutive jackpot
  resolves, "STREAK x2" banner, escalated sting.
- Streak 3: pot × 1.25 at trigger, "STREAK x3", double sting. Compounds
  with the x2 already applied (net ×1.375) — intentional.
- No higher tiers. Bonus money lands in the pot and rides the same risk
  as everything else — the game never hands out risk-free money mid-run.

**Comedown (what pulls the replay):**
- **Bust path:** alarm, then ghost card 1.2s — "You'd have banked: $X".
  Regret is the replay fuel. One tap to retry.
- **Bank path:** honest counterfactual reveal — "Next pull would have
  been: …" (one extra draw from the same RNG source). Would-have-busted →
  relief; would-have-hit → regret. Either branch feeds a replay. Never
  rigged.

## Progression & retention

**Meta-progression is cosmetic-only.** Meta-currency **Gold Bars**: 1 per
$100 banked (floor), persists across runs, spendable only on cosmetics
(dial skins, vault sound packs). Zero effect on in-run odds — the
no-pay-to-win constraint is structural, not policy.

**Daily Vault:** one shared RNG seed per UTC day; leaderboard = best
single bank that day, resets midnight UTC. Submissions happen only on a
completed **bank** event and carry that single run's pot — never session
sums. Ties resolve by earliest submission timestamp.

**Streak calendar:** 3/7/30 consecutive days played unlock cosmetic skin
tiers. No stamina or energy gating anywhere — instant retry is always
available.

## Platform & scope

- Mobile-first web (PWA), single screen, one-handed play. Canvas or
  Phaser. One developer, 4–6 week MVP.
- **Telemetry:** each leaderboard submission piggybacks one event —
  `(pull_count, busted, final_pot, max_streak)` — enough to reconstruct
  observed bust-by-pull, EV curve, and streak frequency against the
  designed constants. No second backend path.
- **Two-mode RNG split (settles leaderboard integrity):**
  - **Casual mode (default):** client RNG from `crypto.getRandomValues`
    — non-deterministic, unpredictable even with devtools. Fully
    offline, zero latency, local high score only, never submits to the
    leaderboard. Ships in v1 as a fully static site.
  - **Daily Vault mode (opt-in, v2):** per-pull server-authoritative
    draws. `POST /run/start` → server-held seed, returns `run_id`;
    `POST /run/{id}/pull` → server deals one outcome: `(bust?, reward
    tier, amount, bustMargin)` where `bustMargin = roll − threshold`
    for survivors (0 = closest possible non-bust; near-miss fires at
    ≤ 5). Client never holds future rolls. Bank validates against the
    server's own record. Round trips hide inside the 1.2s spin;
    connectivity is required in this mode only.
- **Telemetry:** stateless, unauthenticated fire-and-forget
  `POST /telemetry` beacon — `(pull_count, busted, final_pot,
  max_streak)`, no player_id/run_id/auth, edge-level IP rate limit
  (~1 write/IP/5s), no app-level state. Decoupled from the Vault
  backend so casual (default-population) play is measurable. If v1
  ships with no backend at all, casual-mode play is **untuned by
  design until v2** — a stated trade-off, not a gap.

## Decision log

| # | Decision | Proposed (turn) | Promoted (turn) |
|---|---|---|---|
| 1 | Core bust curve `bust(n) = min(2 + 3*(n-1), 45)%` | Turn 1 (friend-1) | Turn 3 (jesse-claude) |
| 2 | Cosmetic-only meta-progression: 1 Gold Bar per $100 banked, zero odds impact | Turn 2 (friend-2) | Turn 6 (jesse-claude, PROMOTE flagged Turn 4) |
| 3 | Greed Zone tier drift on one slope: jackpot 5+2(n−6) cap 15, Small 70−2(n−6) floor 60, Medium fixed | Turn 3 (jesse-claude), formula unified Turn 4, table corrected Turn 5 | Turn 6 (jesse-claude) |
| 4 | One heartbeat curve end to end; amber pre-tell is color-only | Turn 5 (friend-2) | Turn 9 (jesse-claude, PROMOTE flagged Turn 7) |
| 5 | Streak mechanics: pot-riding bonus, x2=×1.10, x3=×1.25 compounding, no x4+ | Turn 6 (jesse-claude) | Turn 9 (ratified Turns 7–8) |
| 6 | Feel ladder with n=16 caps on BANK growth and vignette | Turn 3 (jesse-claude), caps Turn 7 | Turn 9 (ratified Turn 8) |
| 7 | Daily Vault: single-run bank submissions only, earliest-timestamp tiebreak | Turns 2/5/7 | Turn 9 (ratified Turns 7–8) |
| 8 | Core loop micro + macro; streak calendar; no stamina gates | Turns 1/2/4 | Turn 9 (ratified Turns 7–8) |
| 9 | Two-mode RNG split: casual = client crypto RNG offline; Daily Vault = per-pull server draws (v2) | Turn 9 (jesse-claude) | Turn 12 (ratified Turns 10–11) |
| 10 | Stateless v1-shippable telemetry beacon, edge IP rate-limited; else "untuned by design" stated | Turn 10 (friend-1), rate limit Turn 11 | Turn 12 (ratified Turn 11) |
| 11 | `bustMargin = roll − threshold` in Vault per-pull payload; near-miss at ≤5 both modes | Turn 10 (friend-1), sign corrected Turn 11 (friend-2) | Turn 12 (jesse-claude) |
