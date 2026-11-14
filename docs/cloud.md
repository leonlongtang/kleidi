# Cloud sessions

Notes for running this repo in Claude Code cloud sessions (claude.ai/code).

## Standard brief header

Start every cloud brief with these three sentences:

> Setup problems are side quests: work around them, note what happened, and keep going. Ask any questions in one
> round at the start, then don't stop. You're not done until the PR's CI is green; if CI fails, fix it before
> reporting.

## Workflow per ticket

Work comes from GitHub Issues. A brief can then be the header plus: "Follow the workflow in docs/cloud.md for
issue #N."

1. **Read**: `CLAUDE.md`, `docs/spec.md`, then the issue. Touch only the files the issue names.
2. **Build**: implement the issue with `/tdd` where there is logic (`node --test`, `*.test.ts` next to the code).
   UI-only work needs no tests. Open one PR that says `Closes #N`.
3. **Review**: run `/code-review` on the PR and fix what it finds.
4. **Retro**: put anything that slowed the run (a stop, a blocked domain, a setup problem) in the PR description.

The user merges every PR. This is a hackathon: the smallest thing that meets the issue's "done when" wins.

## Setup script

The environment's setup script runs from the folder *above* the repository checkout:

```bash
cd kleidi && npm ci
```

There are no keys in the cloud: never call Gemini, and never launch Playwright (its browser download is blocked and
the headed browser needs a screen). Tickets that need either run locally.
A Stop hook (`.claude/hooks/check.mjs`) runs `npm run check` and blocks finishing while it fails.

## Skills and plugins

Cloud sessions don't install plugins from `.claude/settings.json`. Skills come from the claude.ai account.
