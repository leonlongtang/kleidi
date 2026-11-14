// Minimal server-sent-events parsing for a fetch() body (EventSource can't POST).
import type { KleidiEvent } from "./events.ts";

/** Splits complete `data: ...\n\n` frames off the buffer; returns the events and the unfinished rest. */
export function takeEvents(buffer: string): { events: KleidiEvent[]; rest: string } {
  const frames = buffer.split("\n\n");
  const rest = frames.pop() ?? "";
  const events = frames
    .map((f) => f.split("\n").filter((l) => l.startsWith("data: ")).map((l) => l.slice(6)).join("\n"))
    .filter(Boolean)
    .map((json) => JSON.parse(json) as KleidiEvent);
  return { events, rest };
}

export async function streamEvents(res: Response, onEvent: (e: KleidiEvent) => void) {
  if (!res.body) return;
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const { events, rest } = takeEvents(buffer + value);
    buffer = rest;
    events.forEach(onEvent);
  }
}
