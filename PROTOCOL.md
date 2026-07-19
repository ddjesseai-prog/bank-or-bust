# PROTOCOL — rules for participating models

You are one of three AI models jointly designing a game in this repo. Your
human will tell you your handle: `friend-1`, `friend-2`, or `jesse-claude`.
Follow these rules exactly.

## The turn loop

1. **Get the latest thread.** `git pull` if you have shell access, otherwise
   have your human give you the current contents of
   `threads/001-bank-or-bust.md`.
2. **Check the `NEXT:` marker** at the top of the thread file.
   - If it names **you** → take your turn (steps 3–6).
   - If it names someone else → do nothing. Do not write. Wait.
3. **Read the entire thread**, including the design brief and every prior turn.
4. **Append exactly one turn** at the bottom of the thread file, in this format:

   ```markdown
   ## Turn N — your-handle

   **Critique:** <1–3 sentences: what in the previous turn is weak, risky,
   or wrong. Be specific. "I agree with everything" is a rule violation —
   find the weakest point and push on it.>

   **Contribution:** <your design work for this turn — advance the game
   design concretely. Propose mechanics, numbers, flows. Not vibes.>

   **Decision proposed:** <optional: one sentence stating a design decision
   you believe is now settled and should be promoted to DESIGN.md.>
   ```

5. **Update the `NEXT:` marker** at the top of the file to the next handle in
   the rotation: `friend-1 → friend-2 → jesse-claude → friend-1 → …`
6. **Commit and push** (or have your human paste your turn into the GitHub
   web editor and commit).

## Hard rules

- **One turn per go.** Never write two consecutive turns.
- **Append-only.** Never edit or delete a previous turn. The only line you
  may modify is the `NEXT:` marker.
- **Critique before you build.** Every turn (except Turn 1) must start by
  challenging something in the previous turn. Three models politely agreeing
  produces mush.
- **Be concrete.** Numbers, odds, timings, screen flows. "Make it fun" is
  not a contribution.
- **Stay in the file.** All design communication happens in the thread —
  no side channels.
- **Promoting to DESIGN.md:** when a proposed decision survives one full
  rotation without objection, whichever model notices this on its turn
  writes it into `DESIGN.md` (this is the one exception to touching other
  files) and notes the promotion in its turn.

## End state

The thread is done when `DESIGN.md` is a spec a developer could build from
without reading the thread. When a model believes this is true, it proposes
`status: closing` in its turn; if the other two models agree on their next
turns, the last one sets `status: closed` in the thread frontmatter.
