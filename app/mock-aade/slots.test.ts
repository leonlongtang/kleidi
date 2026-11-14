import { test } from "node:test";
import assert from "node:assert/strict";
import { nextWorkingDays, bookingGrid, slotId, applicationNumber, formatDateEl } from "./slots.ts";

const d = (s: string) => new Date(`${s}T12:00:00`);
const iso = (x: Date) => x.toISOString().slice(0, 10);

test("next working days skip weekends and start tomorrow", () => {
  // Friday 2026-11-13 → Mon..Fri of the following week
  assert.deepEqual(nextWorkingDays(d("2026-11-13"), 5).map(iso), [
    "2026-11-16",
    "2026-11-17",
    "2026-11-18",
    "2026-11-19",
    "2026-11-20",
  ]);
  // Saturday → Monday first
  assert.equal(iso(nextWorkingDays(d("2026-11-14"), 1)[0]), "2026-11-16");
  // Tuesday → Wednesday first, spans the weekend
  assert.deepEqual(nextWorkingDays(d("2026-11-17"), 5).map(iso).slice(-2), ["2026-11-23", "2026-11-24"]);
});

test("slot id is slot-YYYY-MM-DD-HHMM in local time", () => {
  assert.equal(slotId("2026-11-16", "09:30"), "slot-2026-11-16-0930");
});

test("booking grid is 5 days × the same time slots, with stable ids", () => {
  const grid = bookingGrid(d("2026-11-13"));
  assert.equal(grid.length, 5);
  assert.equal(grid[0].date, "2026-11-16");
  assert.ok(grid.every((day) => day.slots.length === grid[0].slots.length && day.slots.length >= 3));
  assert.equal(grid[0].slots[0].id, `slot-2026-11-16-${grid[0].slots[0].time.replace(":", "")}`);
});

test("dates format as Greek dd/mm/yyyy with weekday", () => {
  assert.equal(formatDateEl("2026-11-16"), "Δευτέρα 16/11/2026");
});

test("application number is a stable-format string", () => {
  assert.match(applicationNumber(d("2026-11-14"), () => 0.5), /^ΑΙΤ-2026-\d{6}$/);
});
