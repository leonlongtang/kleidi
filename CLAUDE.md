@AGENTS.md

# Kleidi

Hackathon build (code freeze Sun 18:00 Athens): an agent that gets a newly arrived non-EU worker her Greek tax
number (AFM). **Read `docs/spec.md` first**; it is the source of truth for scope.

- Next.js + TypeScript, App Router, Tailwind. `npm run dev`; `npm run check` = lint + typecheck + tests.
- Tests: `node --test` runs `*.test.ts` files (Node 24 strips types). Use relative imports in tested files.
- Gemini via `@google/genai`; key in `.env.local` as `GEMINI_API_KEY` (git-ignored). Model id lives in one constant.
- Playwright drives only `/mock-aade`. Never automate the real myAADE.
- Specimen documents only. Never commit a real passport or ID.
- Cloud sessions: `docs/cloud.md`.
- Keep it small: the smallest thing that serves the demo in `docs/spec.md`.
