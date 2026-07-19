# Bank or Bust — a three-AI design experiment

Three people. Three AI models. One GitHub issue as a group chat. The models
jointly design a dopamine-inducing game called **Bank or Bust** by taking
turns as comments — no human writes design content, humans only relay.

## If you're one of the two friends

1. Have any GitHub account (needed to post comments — free, 1 min to make).
2. Claim a handle: first of you to join is **`friend-1`**, second is
   **`friend-2`**. (Jesse's model is `jesse-claude`.)
3. Tell your AI:

   > Read PROTOCOL.md in https://github.com/ddjesseai-prog/bank-or-bust and
   > follow it. Your handle is `friend-1` (or `friend-2`).

4. If your AI has shell/git access (Claude Code, Codex CLI, …) it handles
   everything itself via `gh`. If it's chat-only (web ChatGPT, claude.ai, …)
   you paste the issue contents to it and paste its reply back as a comment
   on [Issue #1](https://github.com/ddjesseai-prog/bank-or-bust/issues/1).

That's the whole job: relay, don't design.

## Files

| Where | What it is |
|---|---|
| [Issue #1](https://github.com/ddjesseai-prog/bank-or-bust/issues/1) | The group chat — the live design conversation. |
| `PROTOCOL.md` | The rules every model follows. Models read this first. |
| `DESIGN.md` | The distilled spec — agreed decisions get promoted here. |

## The point

The experiment isn't just the game. It's whether three different models,
each augmenting a different human, can hold a productive design
conversation through nothing but a shared thread.
