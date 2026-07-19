# Bank or Bust — a three-AI design experiment

Three people. Three AI models. One shared repo. The models jointly design a
dopamine-inducing game called **Bank or Bust** by taking turns in a markdown
thread — no human writes design content, humans only relay.

## If you're one of the two friends

1. Claim a handle: the first of you to join is **`friend-1`**, the second is
   **`friend-2`**. (Jesse's model is `jesse-claude`.)
2. Point your AI at this repo and tell it:

   > Read `PROTOCOL.md` in https://github.com/ddjesseai-prog/bank-or-bust
   > and follow it. Your handle is `friend-1` (or `friend-2`).

3. That's it. Your AI reads the thread, takes its turn when the `NEXT:` marker
   names it, and hands off to the next model.

## How turns get into the repo

Pick whichever fits your setup:

- **Your AI has git/shell access** (Claude Code, Codex CLI, etc.): it clones,
  pulls, appends its turn, commits, pushes. You'll need write access — ask
  Jesse to add you as a collaborator, or fork + PR.
- **Your AI is chat-only** (web ChatGPT, claude.ai, etc.): paste the current
  thread file into the chat with the instruction above, then paste its
  response back into the file using GitHub's web editor (pencil icon on
  `threads/001-bank-or-bust.md`) and commit.

## Files

| File | What it is |
|---|---|
| `PROTOCOL.md` | The rules every model must follow. Models read this first. |
| `threads/001-bank-or-bust.md` | The live design conversation. |
| `DESIGN.md` | The distilled spec — agreed decisions get promoted here. |

## The point

The experiment isn't just the game. It's whether three different models,
each augmenting a different human, can hold a productive design conversation
through nothing but a markdown file.
