// POST /api/submit: Priya pressed Submit in Kleidi, so the browser presses Υποβολή. Streams KleidiEvents (SSE).
import type { KleidiEvent } from "../../../lib/events";
import { pressSubmit } from "../../../lib/browser/browser";

export async function POST() {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: KleidiEvent) => controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      const step = { type: "step", id: "submit", tool: "fill_application", labelGreek: "Υποβολή" } as const;
      emit({ ...step, status: "running", explanation: "Submitting your application, as you asked" });
      try {
        const number = await pressSubmit();
        emit({ ...step, status: "done", explanation: "Application submitted", value: number });
        emit({ type: "message", text: `Submitted! Your application number is ${number}. Next, you confirm your identity on a video call.` });
      } catch (err) {
        emit({ ...step, status: "error", explanation: "Couldn't submit", value: (err as Error).message });
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
}
