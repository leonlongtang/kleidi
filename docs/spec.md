# Kleidi — spec (v2)

Hackathon theme "agents at work". Code freeze **Sun 2026-11-15 18:00 Athens**. Solo build.
Judges want one user, one job end to end, one wow moment. They got two: the fastest legal plan, and a hire they
record themselves.

## User and job

**Eleni**, accountant at a small Athens accounting office (~40 small-business clients). Friday evening a client
sends a Greek voice note: "Προσλάβαμε την Πρίγια από Δευτέρα, κάνε ό,τι χρειάζεται", plus photos of Priya's
passport and employment contract.

**Priya Raman** is an **Italian (EU) citizen**. No work permit is involved anywhere: there is no permit logic, field
or label in this app. She has **no Greek AFM, no AMKA**, and her **IBAN is missing**.

**Job: "Hire Priya legally, as early as possible."** Kleidi turns the voice note and the photos into a checked
employee record, the fastest legal plan, a filled payroll entry (verified against its database) and a Greek reply to
the client.

## Demo flow (2 minutes)

1. **0:00–0:15, scripted Priya case.** The inbox (8–10 seeded messages) sorts itself by client, type and urgency;
   the new-hire voice note opens. Plan: the requested **"Monday 09:00" crosses out in red**, the steps light up in
   order, and it lands on the **earliest legal start, "Tuesday 09:00", in green**.
2. **0:15–1:40, "Now you try."** A judge scans the QR code, holds the button on `/record` and says a hire ("We hired
   Priya from Wednesday, part-time, 20 hours"). Within seconds it appears in Eleni's inbox and the flow starts by
   itself: parse → document check (MRZ + catches) → plan for their start day → the judge types a **shuffle seed** →
   computer use fills the payroll app → the stored **DB row is shown field by field with green ticks**.
3. **1:40–2:00.** Eleni reviews and approves each field next to its document crop → the payroll app files to mock
   ERGANI → Greek message to the client with the plan, English checklist for Priya → closing line (accountant quote,
   fair timing including review time).

## The plan (deterministic)

`lib/plan/` computes a **time-ordered plan** and the **earliest legal start** from `rules.json`, a `HireRequest`
and a configurable **now** (so the demo works on whatever day we present). No LLM in the logic; the LLM only writes
the explanations and messages.

- Chain (from the accountant; correct it in `rules.json` without code changes): EU registration certificate at the
  police → AFM at the tax office → AMKA → **work-start declaration** ("Ψηφιακή Αναγγελία Έναρξης Εργασίας", ERGANI
  II), which must be filed **before** she starts → her acceptance in MyErgani. Her acceptance can be a handwritten
  signature, so it is **not** a hard blocker. IBAN is needed for wages, not to start.
- Each step: Greek and English label, where (office with working days and hours, or online 24/7), duration labelled
  as an **estimate** (same-day / next-day), what it needs, whether it blocks the start, and a source link.
- Working days and office hours are configurable. The earliest legal start is the first working day, at the
  requested time of day, after every blocking step is done.
- Works for **any requested weekday and time** relative to now. Under the timeline, one line: "Starting without the
  declaration = €10,500 fine per employee."
- Outputs: a Greek message to the client with the plan and what we need from them; an English checklist for the
  employee (what to bring, where to go).

## Inputs and checks

- **HireRequest** (`lib/hire/types.ts`), parsed from the voice note by Gemini, Greek **or** English speech:
  `{ employeeName, startDay: mon–fri, startTime?, employmentType: full | part-time, hoursPerWeek?, notes, language }`.
  Guardrails: start day Mon–Fri, full- or part-time only. Anything else, the agent says politely that it's out of
  scope instead of guessing. Replies to the client are always Greek.
- **Documents** are a fixed prepared set: Priya's specimen Italian passport and Greek employment contract. The
  contract spells her name differently (the planted mismatch).
- **MRZ check** (`lib/check/`): parse the passport's TD3 machine-readable zone deterministically with check digits,
  then cross-check it against the vision extraction, the contract and the voice note. Show "verified by checksum" or
  each **catch**, with which source wins and why:
  - identity (name, date of birth, passport number): the passport MRZ wins (checksummed);
  - start day, hours, employment type: the client's voice note wins (latest instruction); the contract needs an
    amendment, and the client message says so.
- The payroll fill uses the judge's details: the name from the voice note if it matches the documents, their start
  day and their hours.

## Systems

- **Inbox** (`/`): seeded messages plus a real-time push channel (SSE). A new voice note from `/record` appears in a
  few seconds and its case starts automatically.
- **`/record`**: mobile page, opened from a QR code on the main screen. One big "hold to record" button styled like
  a messaging app; records in the browser (MediaRecorder) and uploads. Fallbacks: (a) a pre-recorded voice note
  button, (b) the same record button on the laptop. When a fallback is used, the UI says so.
- **Mock payroll app** (`/mock-payroll`): legacy-looking but believable desktop-app window (not Windows 98). Stores
  employees in SQLite (`node:sqlite`, no new dependency). On submit it **files the declaration to the mock ERGANI
  backend itself**, like real payroll software. There is no separate ERGANI API step or pane, and no parallel panes.
- **Shuffle**: a seed generates the variant (field order, label wording, a surprise popup, one validation error the
  agent must fix). A judge picks or types the seed live.
- **Computer use**: a Gemini Computer Use loop drives Playwright (headed) and fills the payroll app **once**. A
  deterministic Playwright fill stays as the demo-safe fallback; if it ever runs, the UI says so visibly.
- **Verification**: after the fill, the payroll app's stored DB row is shown next to the form, field by field. Green
  ticks come from comparing DB state with the extracted record, **not** from the model reading its own screenshot.
- **Approval**: one "review & approve" screen before the payroll submit, each field with its document source crop.
- **Mock AADE** (`/mock-aade`, already built) stays only as a step in the plan, not a live pane.

## Architecture

- **Next.js + TypeScript**, App Router, Tailwind. One desktop page plus the mobile `/record`.
- **Gemini** via `@google/genai`; model ids in one place (`lib/agent/model.ts`). Key in `.env` / `.env.local`.
- Every pipeline step emits a step event, streamed over SSE (`lib/events.ts`, `lib/sse.ts`).
- **Never automate a real government site** (myAADE, ERGANI, EFKA). Mocks only.

## Rehearsal harness

`scripts/rehearse` generates 20 random hire requests (name, weekday, full/part-time, Greek or English), synthesises
each as audio with Gemini TTS, and runs the whole pipeline end to end, including the shuffled payroll fill and DB
verification. Report: success rate, p90 total time, and the failing step for each failure. Target **20/20 and p90
under 60 s** from voice note to verified DB row. If over, cut fields.

## Data

Specimen documents only: invented name and numbers, marked SPECIMEN. No real passport anywhere (repo, video, logs).

## Out of scope

Real government logins or sites, work/residence permits, Viber or phone calls, confidence numbers, live AADE/gov.gr
fetch, an ERGANI API route, parallel panes, replies to the non-hire inbox items, more than one employee per message,
weekend starts. Optional, only after the user confirms: a Greek voice reply (Gemini TTS) played after approval.

## Milestones

- **Sat 23:59** — ugly end to end: pre-recorded voice note → inbox → checks → plan → payroll fill → DB row verified
- **Sun 09:00** — `/record` live, approve, Greek message, rehearsal 20/20
- **Sun 12:00** — demo video recorded
- **Sun 18:00** — code freeze: repo, demo video, project details submitted

## Build plan

Local session builds everything that calls Gemini or Playwright. At most two cloud sessions at once
(`/cloud-ticket kleidi <N>`), each on files no other ticket touches.
