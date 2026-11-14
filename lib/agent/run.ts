// One user turn: Gemini with function calling, looping until it answers in text.
import type { Part } from "@google/genai";
import { ai, MODEL } from "./model.ts";
import { isComplete } from "./profile.ts";
import type { Image, Session } from "./session.ts";
import { declarations, runTool, type Emit } from "./tools.ts";

const SYSTEM = `You are Kleidi. You help a newly arrived non-EU worker in Greece get their Greek tax number (AFM).
Write plain, short English: at most three sentences per message. Never invent document data.

Flow:
1. When the user says they moved for a job or need to get paid, call get_procedure("afm_tax_resident_foreign").
   Then say in one line why they need an AFM first, and ask for photos of their passport and residence permit.
2. For every image id in an [Attached images: ...] note, call extract_document. If one fails, say what to retake.
3. Once both documents are read, ask in one message for their Greek home address (street, number, postcode, city;
   it decides their tax office), email and mobile. When they answer, call save_details. If it reports errors,
   ask only for what is wrong.
4. As soon as save_details succeeds, call fill_application once. In its notes, add one short personalised line
   where it helps, e.g. for address_postcode which tax office area her postcode points to (no office names you
   are unsure of). Then tell her to read the summary and press Submit herself; never claim it is submitted.
Only if there is no residence permit: mention the procedure's pending-permit gotcha in one line.`;

const MAX_ROUNDS = 8;

export async function runTurn(s: Session, text: string, images: Image[], emit: Emit) {
  const ids = images.map((img) => {
    const id = `image_${s.images.size + 1}`;
    s.images.set(id, img);
    return id;
  });
  const note = ids.length ? `\n[Attached images: ${ids.join(", ")}]` : "";
  s.history.push({ role: "user", parts: [{ text: (text || "(photos)") + note }] });

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const res = await ai().models.generateContent({
      model: MODEL,
      contents: s.history,
      config: { systemInstruction: SYSTEM, tools: [{ functionDeclarations: declarations }] },
    });
    const content = res.candidates?.[0]?.content;
    if (!content?.parts?.length) {
      emit({ type: "message", text: "Sorry, I lost my train of thought. Could you say that again?" });
      return;
    }
    s.history.push(content); // pushed unchanged: Gemini needs its thought signatures back

    const said = content.parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim();
    if (said) emit({ type: "message", text: said });

    const calls = content.parts.filter((p) => p.functionCall).map((p) => p.functionCall!);
    if (!calls.length) return;

    const responses: Part[] = [];
    for (const call of calls) {
      const out = await runTool(call.name ?? "", (call.args ?? {}) as Record<string, unknown>, s, emit);
      responses.push({ functionResponse: { id: call.id, name: call.name, response: out } });
    }
    s.history.push({ role: "user", parts: responses });
  }
  emit({ type: "message", text: isComplete(s.profile) ? "Everything's ready." : "Let's keep going: what's next?" });
}
