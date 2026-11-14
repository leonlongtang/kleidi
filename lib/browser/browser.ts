// The headed Chromium that fills the mock portal. Selectors are the procedure's field ids; values come from the profile.
import { chromium, type Page } from "playwright";
import type { KleidiEvent } from "../events.ts";
import type { FieldFill } from "./values.ts";

const BASE_URL = process.env.KLEIDI_BASE_URL ?? "http://localhost:3000";
// Calibration knobs for the demo take: left half of a 1440×900 screen, slow enough to follow.
const WINDOW = { x: 0, y: 0, width: 720, height: 900 };
const SLOW_MO_MS = 40;
const TYPE_DELAY_MS = 25;

export type Upload = { name: string; mimeType: string; buffer: Buffer };

// ponytail: one browser for the whole process (single-user demo), kept on globalThis to survive dev reloads.
const g = globalThis as unknown as { kleidiPage?: Page; kleidiFilled?: boolean };

async function page(): Promise<Page> {
  const p = g.kleidiPage;
  if (p && !p.isClosed() && p.context().browser()?.isConnected()) return p;
  const browser = await chromium.launch({
    headless: false,
    slowMo: SLOW_MO_MS,
    args: [`--window-position=${WINDOW.x},${WINDOW.y}`, `--window-size=${WINDOW.width},${WINDOW.height}`],
  });
  g.kleidiPage = await browser.newPage({ viewport: null });
  return g.kleidiPage;
}

/** Fills every field and stops before Υποβολή. `notes` adds a personalised line to a field's explanation. */
export async function fillApplication(
  fills: FieldFill[],
  uploads: Partial<Record<string, Upload>>,
  notes: Record<string, string>,
  emit: (e: KleidiEvent) => void,
) {
  g.kleidiFilled = false;
  const p = await page();
  await p.bringToFront();
  await p.goto(`${BASE_URL}/mock-aade`);
  for (const { field, value, shown } of fills) {
    const explanation = notes[field.id] ? `${field.explanationEn} ${notes[field.id]}` : field.explanationEn;
    const step = (status: "running" | "done") =>
      emit({ type: "step", id: `fill-${field.id}`, tool: "fill_application", status, labelGreek: field.labelEl, explanation, value: shown });
    step("running");
    const el = p.locator(`#${field.id}`);
    await el.scrollIntoViewIfNeeded();
    if (value) {
      if (field.type === "text") {
        await el.fill("");
        await el.pressSequentially(value, { delay: TYPE_DELAY_MS });
      } else if (field.type === "date") await el.fill(value);
      else if (field.type === "select") await el.selectOption(value);
      else {
        const file = uploads[value];
        if (!file) throw new Error(`No uploaded ${value} to attach`);
        await el.setInputFiles(file);
      }
    }
    step("done");
  }
  await p.locator("#submit").scrollIntoViewIfNeeded();
  g.kleidiFilled = true;
}

/** Priya clicked Submit in Kleidi: press Υποβολή and return the application number. */
export async function pressSubmit(): Promise<string> {
  const p = g.kleidiPage;
  if (!g.kleidiFilled || !p || p.isClosed()) throw new Error("The application isn't filled in yet.");
  g.kleidiFilled = false;
  await p.locator("#submit").click();
  await p.waitForURL("**/mock-aade/submitted");
  return (await p.locator("#application-number").textContent()) ?? "";
}
