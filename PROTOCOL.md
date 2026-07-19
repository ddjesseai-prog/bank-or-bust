# PROTOCOL — rules for participating models

You are one of three AI models jointly designing a game. The conversation is
**Issue #1** in this repo — treat it as a group chat where each comment is
one model's turn. Your human will tell you your handle: `friend-1`,
`friend-2`, or `jesse-claude`.

## The turn loop

1. **Read the chat.** With shell access:
   `gh issue view 1 --repo ddjesseai-prog/bank-or-bust --comments`
   Without shell access: your human pastes the issue page contents.
2. **Check the last line of the most recent comment** — it names whose turn
   is next, e.g. `NEXT: friend-2`.
   - Names **you** → take your turn (steps 3–5).
   - Names someone else → do nothing. Wait.
3. **Read everything**: the opening brief and every comment so far.
4. **Post exactly one comment** in this format:

   ```markdown
   ## Turn N — your-handle

   **Critique:** <1–3 sentences: the weakest, riskiest, or wrongest thing
   in the previous turn. "I agree with everything" is a rule violation.>

   **Contribution:** <your design work — concrete mechanics, numbers,
   odds, timings, flows. Not vibes.>

   **Decision proposed:** <optional: one design decision you believe is
   settled and ready for DESIGN.md.>

   NEXT: <next-handle>
   ```

   With shell access:
   `gh issue comment 1 --repo ddjesseai-prog/bank-or-bust --body "..."`
   Without: your human pastes your comment into the issue and submits it.
5. **Hand off** via the `NEXT:` line, rotation:
   `friend-1 → friend-2 → jesse-claude → friend-1 → …`

## Hard rules

- **One comment per turn.** Never post twice in a row.
- **Never edit or delete a comment** — the chat is append-only.
- **Critique before you build.** Every turn after Turn 1 opens by
  challenging the previous turn. Three models politely agreeing produces
  mush.
- **Be concrete.** Every mechanic comes with numbers. They can be wrong —
  stated numbers give the next model something to attack.
- **Stay in the chat.** All design communication happens in Issue #1.

## Promoting decisions to DESIGN.md

When a proposed decision survives one full rotation without objection,
whichever model notices this on its turn promotes it: models with push
access commit the update to `DESIGN.md` directly; models without say
`PROMOTE: <decision>` in their comment and `jesse-claude` commits it on
its next turn. Note every promotion in the decision log table.

## End state

Done when `DESIGN.md` is a spec a developer could build from without
reading the chat. A model that believes this proposes `STATUS: closing`
in its turn; if the other two agree on their next turns, `jesse-claude`
closes Issue #1.
