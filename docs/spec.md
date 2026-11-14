# Kleidi — spec

Hackathon theme "agents at work". Code freeze **Sun 18:00 Athens**. Solo build.
Judges want one user, one job end to end, one wow moment.

## User and job

**Priya**, Indian software engineer (non-EU), just moved to Athens, starts at a startup on Monday. No Greek.
She holds a passport and a Greek residence permit. **Job: "Get me my AFM"** (Greek tax number), needed before she
can be paid.

Pitch-only business angle (do not build): HR and relocation teams pay people to do this for every foreign hire.

## The real procedure (source of truth)

AADE Registry Procedures Guide v1.2 (June 2026), **§3.1.2 "Issuance of TIN & Authentication Key to foreign
nationals who are tax residents of Greece"**, pp. 10–12:
https://aade.gr/sites/default/files/2026-06/REGISTRY%20PROCEDURES%20GUIDE.pdf

- Application is submitted by the person herself, exclusively online in myAADE. **No tax representative** (that is
  the non-resident path, §3.1.3).
- The competent Tax Office / KEFODE is set by her residential address.
- Identification after submitting: book a **myAADElive** video-call appointment, or a direct video call with the
  first available agent, or visit a tax office.
- Documents: identification document (passport); **valid residence permit** (non-EU nationals); marriage or civil
  partnership certificate if applicable (apostille + official Greek translation).
- Result: TIN certificate and Authentication Key (κλειδάριθμος) arrive by email in an encrypted file.

Gotcha the agent states in one line (do not act on it): a recent arrival may only hold a type-D visa while the
permit card is pending; the guide asks for a valid residence permit. Don't claim what AADE accepts instead.

## Demo flow (~90 s)

1. Priya: "I just moved to Greece for a job, I need to get paid."
2. Agent: she needs an AFM first, one-line why.
3. She uploads photos of her passport and residence permit → structured data.
4. Checklist: **Have** (passport, permit) / **Need from you** (Greek address — decides her tax office; email; phone)
   / **You'll do** (join the video call with your passport). Agent asks for the address in chat.
5. **WOW**: a real, headed Chromium window (left of screen) fills the Greek-only mock myAADE form by itself
   (types, picks dropdowns, attaches the documents) while the app's English side panel explains each field.
   The agent stops before submitting; Priya reads the English summary and clicks **Submit** herself.
6. She clicks to book the myAADElive video-call slot (plain button, first free slot) → confirmation + `.ics` file.

## Architecture

- **Next.js + TypeScript**, App Router, one app, one desktop page (no mobile-first work). Tailwind.
- **Orchestrator**: Gemini Flash via `@google/genai`, function calling. `GEMINI_API_KEY` from AI Studio (project
  `genaihack26ath-53`). Model id in one constant `MODEL`.
- **Tools**
  - `extract_document(image)` → typed JSON (Gemini vision), validated with zod. Types: passport, residence_permit.
  - `get_procedure("afm_tax_resident_foreign")` → hand-written JSON: steps, required docs, gotchas, and for each
    form field the Greek label → plain-English explanation. Cites §3.1.2 and page numbers. **No RAG.**
  - `fill_application(profile)` → Playwright, headed, `slowMo`, fixed window position, against `/mock-aade`.
    Deterministic selectors; the LLM decides values and adds one personalised line, never where to click. Stops
    before Submit.
  - `book_slot()` → picks the first free slot on the mock portal, returns an `.ics` file.
- Every tool call emits a step event, streamed to the side panel (SSE).
- **Mock AADE portal** `/mock-aade`: Greek only, modelled on the §3.1.2 application. **Never automate the real
  myAADE.**

## Data

Specimen documents only: invented name and number, marked SPECIMEN. No real passport anywhere (repo, video, logs).

## Demo setup

Runs on the laptop. Record the demo video by **Sun 12:00** at the latest; the video is the fallback. Optional:
deploy chat + mock portal (no Playwright) to Cloud Run on `genaihack26ath-53` if a judge needs a link.

## Out of scope

Real government logins, other procedures, accounts/auth, admin dashboard, payments, live voice/phone, mobile
layout, replay/fixtures mode. Stretch (Sun morning, only if core is solid): Gemini Live interpreter for the video
call.

## Milestones

- **Sat 20:00** — ugly end to end: photo → JSON → checklist → mock form filled
- **Overnight** — the wow polished (headed browser + explanation panel)
- **Sun morning** — polish only what the demo touches; record the video early
- **Sun 18:00** — code freeze: repo, demo video, project details submitted

## Build plan

Local session builds the orchestrator and tools. At most two cloud sessions at once (`/cloud-ticket kleidi <N>`),
each on files no other ticket touches.
