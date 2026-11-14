// POST /api/agent: run one user turn and stream KleidiEvents back as server-sent events.
import { z } from "zod";
import type { KleidiEvent } from "../../../lib/events";
import { runTurn } from "../../../lib/agent/run";
import { getSession } from "../../../lib/agent/session";

const MAX_IMAGE_CHARS = 10_000_000; // ~7 MB per image as base64
const DataUrl = z
  .string()
  .max(MAX_IMAGE_CHARS)
  .regex(/^data:image\/(png|jpeg|webp|heic|heif);base64,[A-Za-z0-9+/=]+$/, "images must be base64 data URLs");

const Body = z.object({
  sessionId: z.uuid(),
  text: z.string().max(4000),
  images: z.array(DataUrl).max(4).default([]),
});

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: z.prettifyError(body.error) }, { status: 400 });

  const { sessionId, text, images } = body.data;
  const decoded = images.map((url) => {
    const [head, data] = url.split(",");
    return { mimeType: head.slice(5, head.indexOf(";")), data };
  });

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: KleidiEvent) => controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        await runTurn(getSession(sessionId), text, decoded, emit);
      } catch (err) {
        console.error(err);
        emit({ type: "message", text: `Something went wrong on my side: ${(err as Error).message}` });
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
}
