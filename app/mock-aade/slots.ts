// Pure helpers for the mock myAADElive booking grid and the application number.

export const SLOT_TIMES = ["09:00", "10:30", "12:00", "13:30"];

const WEEKDAYS_EL = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date as YYYY-MM-DD. */
export const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The next `count` Mon–Fri days after `from` (from itself excluded). */
export function nextWorkingDays(from: Date, count: number): Date[] {
  const days: Date[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
  }
  return days;
}

export const slotId = (date: string, time: string) => `slot-${date}-${time.replace(":", "")}`;

export type Slot = { id: string; time: string };
export type GridDay = { date: string; slots: Slot[] };

export function bookingGrid(from: Date): GridDay[] {
  return nextWorkingDays(from, 5).map((day) => {
    const date = toYmd(day);
    return { date, slots: SLOT_TIMES.map((time) => ({ id: slotId(date, time), time })) };
  });
}

/** "2026-11-16" → "Δευτέρα 16/11/2026" */
export function formatDateEl(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${WEEKDAYS_EL[new Date(y, m - 1, d).getDay()]} ${pad(d)}/${pad(m)}/${y}`;
}

export function applicationNumber(now: Date, random: () => number = Math.random): string {
  return `ΑΙΤ-${now.getFullYear()}-${String(Math.floor(random() * 1_000_000)).padStart(6, "0")}`;
}
