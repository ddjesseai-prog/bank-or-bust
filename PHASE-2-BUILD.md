# PHASE 2 — BUILD (one-shot, zero human intervention)

This phase turns `DESIGN.md` into a playable, hosted game in a single
unattended run. It triggers when Issue #1 reaches `STATUS: closing` **or**
Jesse says "build it" — whichever comes first. From that moment, no human
touches anything until the link is live.

## Build constraints (what makes one-shot possible)

- **Vanilla HTML/JS/CSS, single static site, no build step.** No npm, no
  bundler, no framework. If it can't be served by opening `index.html`,
  it's out of scope.
- **Everything lives in `docs/`** — GitHub Pages serves it directly from
  the `main` branch. `docs/index.html` is the whole game entry point.
- **No backend.** v1 ships local high score (localStorage). The Daily
  Vault leaderboard (needs server-side RNG-transcript validation per the
  spec) is explicitly deferred to v3 — do not stub half a backend.
- **Spec fidelity:** implement `DESIGN.md` as written. Where the spec is
  silent, make the smallest reasonable choice and log it in
  `docs/DEVIATIONS.md` — never block waiting for an answer.
- **Haptics/audio degrade gracefully:** use the Vibration API and WebAudio
  where available, no-op where not. Never gate play on a capability.

## The one-shot sequence (executed by jesse-claude)

1. Build the game into `docs/` from `DESIGN.md` (+ any thread decisions
   promoted by then). Include a minimal `docs/DEVIATIONS.md`.
2. Smoke-test locally: serve `docs/`, load in headless browser, verify the
   core loop runs (pull → reward → bank/bust) with no console errors.
3. Commit and push to `main`.
4. Enable GitHub Pages via API (no dashboard):
   ```
   gh api -X POST repos/ddjesseai-prog/bank-or-bust/pages \
     -f "source[branch]=main" -f "source[path]=/docs"
   ```
   (If already enabled, this 409s — that's fine, continue.)
5. Poll until live, then verify:
   ```
   curl -sf https://ddjesseai-prog.github.io/bank-or-bust/ | grep -q "Bank or Bust"
   ```
6. Add the play link to `README.md`, commit, push.
7. Post a comment on Issue #1: the play link, the deviations list, and
   `PHASE: build-shipped`.

Failure at any step: fix and retry within the same run. The run ends only
in one of two states — link posted, or a single comment on Issue #1
explaining exactly what's blocked. Never end silently.

## For friend-1 / friend-2 bots: launch your own copy

You don't need write access to ship your own variant. One-shot for you too:

```bash
gh repo fork ddjesseai-prog/bank-or-bust --clone && cd bank-or-bust
# (optional) modify docs/ — tune constants in docs/game.js, reskin, etc.
git push origin main
gh api -X POST repos/<your-user>/bank-or-bust/pages \
  -f "source[branch]=main" -f "source[path]=/docs"
# live in ~1 min at: https://<your-user>.github.io/bank-or-bust/
```

Or run it locally with zero hosting: `python3 -m http.server -d docs 8080`
→ http://localhost:8080. There is no build step; the files are the game.

Post your fork's link as a comment on Issue #1 so the variants can be
compared side by side.

## Improving the game after v1 (v2 loop, still no humans)

Code changes from friend bots come as pull requests from forks
(`gh pr create`), reviewed by the other two models as PR comments under
the same critique-first rule as PROTOCOL.md. jesse-claude merges when both
reviewers approve; every merge auto-deploys via Pages. The design thread
stays the place for *what* to change; PRs are *how*.
