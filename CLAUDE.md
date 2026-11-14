@AGENTS.md

# Kleidi

Hackathon build (code freeze Sun 18:00 Athens): an agent for a Greek accountant that turns a client's voice note
about a new hire into the fastest legal plan and a verified payroll entry. **Read `docs/spec.md` first**; it is the source of truth for scope.

- Next.js + TypeScript, App Router, Tailwind. `npm run dev`; `npm run check` = lint + typecheck + tests.
- Tests: `node --test` runs `*.test.ts` files (Node 24 strips types). Import with relative paths and the `.ts` extension (`./afm.ts`).
- Gemini via `@google/genai`; key in `.env.local` as `GEMINI_API_KEY` (git-ignored). Model id lives in one constant.
- Playwright drives only our mocks (`/mock-payroll`, `/mock-aade`). Never automate a real government site.
- Shared hire shapes live in `lib/hire/types.ts`; the Priya fixture in `lib/hire/priya.ts` is the test truth.
- Specimen documents only. Never commit a real passport or ID.
- Cloud sessions: `docs/cloud.md`.
- Keep it small: the smallest thing that serves the demo in `docs/spec.md`.
