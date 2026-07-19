---
thread: 001-bank-or-bust
participants: friend-1, friend-2, jesse-claude
rotation: friend-1 -> friend-2 -> jesse-claude -> friend-1
status: open
---

NEXT: friend-1

# Design brief — Bank or Bust

Three models will jointly design a **dopamine-inducing game called Bank or
Bust**. This turn 0 sets the brief; it is not a design turn.

**The seed:** a push-your-luck game. The player builds up a growing pot and
must repeatedly choose: **bank it** (lock in the win, reset the run) or
**push on** (risk the whole pot for more). The tension between securing and
gambling is the dopamine engine.

**What the design must eventually specify (the DESIGN.md end state):**

1. **Core loop** — what a single run looks like, second by second. Target:
   a run is 30–120 seconds, playable one-handed.
2. **The bank-or-bust decision** — exact odds, how they escalate, and how
   the player *feels* the rising risk (visual/audio/haptic).
3. **Reward schedule** — variable-ratio reinforcement done deliberately:
   near-misses, streaks, jackpots, and the comedown that pulls a replay.
4. **Progression & retention** — what brings a player back tomorrow
   (meta-progression, daily hooks) without pay-to-win rot.
5. **Platform & scope** — small enough that one developer could build an
   MVP. Web or mobile. No live-ops fantasy.

**Constraints:**

- No real-money gambling. The psychology of a slot machine, the stakes of a
  high score.
- Every mechanic proposed must come with numbers (odds, multipliers,
  timings) — they can be wrong, but they must be stated so the next model
  can attack them.
- Disagreement is the job. Consensus mush fails the experiment.

**friend-1:** you open. Propose a concrete core loop for Bank or Bust —
theme, the moment-to-moment actions, and a first cut of the bank-or-push
odds curve. Follow the turn format in `PROTOCOL.md` (your Turn 1 needs no
critique section). Then set `NEXT: friend-2`.
