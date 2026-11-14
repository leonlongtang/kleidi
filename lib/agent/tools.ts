// The tools Gemini can call. Each one emits step events for the side panel and returns plain JSON to the model.
import type { FunctionDeclaration } from "@google/genai";
import type { KleidiEvent } from "../events.ts";
import { fillApplication } from "../browser/browser.ts";
import { fieldFills } from "../browser/values.ts";
import { afmProcedure, getProcedure } from "../procedure/afm.ts";
import { ai, MODEL } from "./model.ts";
import { checklistFor, isComplete } from "./profile.ts";
import { ExtractionJsonSchema, parseContact, parseExtraction } from "./schemas.ts";
import type { Session } from "./session.ts";

export type Emit = (e: KleidiEvent) => void;
type Result = Record<string, unknown>;

export const declarations: FunctionDeclaration[] = [
  {
    name: "get_procedure",
    description: "Get the official steps, required documents and gotchas for a Greek government procedure.",
    parametersJsonSchema: {
      type: "object",
      properties: { id: { type: "string", enum: ["afm_tax_resident_foreign"] } },
      required: ["id"],
    },
  },
  {
    name: "extract_document",
    description: "Read one uploaded photo of a passport or residence permit into structured data.",
    parametersJsonSchema: {
      type: "object",
      properties: { image_id: { type: "string", description: "An id from the user's [Attached images: ...] note" } },
      required: ["image_id"],
    },
  },
  {
    name: "save_details",
    description: "Save the user's Greek home address, email and mobile number once they have given them.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        street: { type: "string" },
        number: { type: "string" },
        postcode: { type: "string" },
        city: { type: "string" },
        email: { type: "string" },
        mobile: { type: "string", description: "With country code, e.g. +30 690 000 0000" },
      },
      required: ["street", "number", "postcode", "city", "email", "mobile"],
    },
  },
  {
    name: "fill_application",
    description:
      "Fill in the AFM application on the tax portal from the saved profile, in a visible browser. Stops before submitting; the user submits.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        notes: {
          type: "array",
          description: "Optional personalised one-liners shown next to a field's explanation.",
          items: {
            type: "object",
            properties: {
              field_id: { type: "string", enum: afmProcedure.fields.map((f) => f.id) },
              note: { type: "string" },
            },
            required: ["field_id", "note"],
          },
        },
      },
    },
  },
];

export async function runTool(name: string, args: Result, s: Session, emit: Emit): Promise<Result> {
  const id = `${name}-${++s.steps}`;
  const step = (status: "running" | "done" | "error", explanation: string, value?: string) =>
    emit({ type: "step", id, tool: name, status, explanation, value });

  switch (name) {
    case "get_procedure": {
      const r = getProcedure(String(args.id));
      if (!r.ok) {
        step("error", r.error);
        return { error: r.error };
      }
      const { fields, ...rest } = r.procedure; // the form fields are for the browser, not the conversation
      step("done", `${r.procedure.source.title}, ${r.procedure.source.section.split(" ")[0]}`, `pp. ${rest.source.pages.join("–")}`);
      void fields;
      return rest;
    }

    case "extract_document": {
      const image = s.images.get(String(args.image_id));
      if (!image) {
        step("error", `No uploaded image called ${args.image_id}`);
        return { error: `Unknown image_id ${args.image_id}` };
      }
      step("running", "Reading the document");
      const res = await ai().models.generateContent({
        model: MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: image },
              {
                text:
                  "Extract the fields of this identity document exactly as printed. Dates as YYYY-MM-DD. " +
                  "Leave a field empty if it is not on the document. kind=other if it is not a passport or residence permit.",
              },
            ],
          },
        ],
        config: { responseMimeType: "application/json", responseJsonSchema: ExtractionJsonSchema },
      });
      let raw: unknown;
      try {
        raw = JSON.parse(res.text ?? "");
      } catch {
        raw = undefined;
      }
      const doc = parseExtraction(raw);
      if (!doc.ok) {
        step("error", "Couldn't read this document", doc.error);
        return { error: doc.error };
      }
      if (doc.value.kind === "passport") s.profile.passport = doc.value;
      else s.profile.permit = doc.value;
      s.uploads[doc.value.kind] = image;
      const label = doc.value.kind === "passport" ? "Passport read" : "Residence permit read";
      step("done", label, `${doc.value.surname}, ${doc.value.givenNames} · valid to ${doc.value.dateOfExpiry}`);
      emit({ type: "checklist", ...checklistFor(s.profile) });
      return { ok: true, document: doc.value };
    }

    case "save_details": {
      const c = parseContact(args);
      if (!c.ok) {
        step("error", "Some details need fixing", c.error);
        return { error: c.error };
      }
      s.profile.contact = c.value;
      step("done", "Address and contact details saved", `${c.value.street} ${c.value.number}, ${c.value.postcode} ${c.value.city}`);
      emit({ type: "checklist", ...checklistFor(s.profile) });
      return { ok: true };
    }

    case "fill_application": {
      if (!isComplete(s.profile)) return { error: "Profile incomplete: read both documents and save_details first." };
      const notes = Object.fromEntries(
        (Array.isArray(args.notes) ? args.notes : []).map((n: { field_id?: unknown; note?: unknown }) => [String(n.field_id), String(n.note)]),
      );
      const uploads = Object.fromEntries(
        Object.entries(s.uploads).map(([kind, img]) => [
          kind,
          { name: `${kind.replace("_", "-")}.${img.mimeType.split("/")[1]}`, mimeType: img.mimeType, buffer: Buffer.from(img.data, "base64") },
        ]),
      );
      const fills = fieldFills(s.profile);
      try {
        await fillApplication(fills, uploads, notes, emit);
      } catch (err) {
        step("error", "The portal form couldn't be filled", (err as Error).message);
        return { error: (err as Error).message };
      }
      const { passport: pp, contact: c } = s.profile;
      emit({
        type: "awaitingSubmit",
        summary:
          `Application for an AFM as a foreign tax resident (§3.1.2): ${pp!.givenNames} ${pp!.surname}, ${pp!.nationality} national, ` +
          `passport ${pp!.passportNumber} and residence permit attached, address ${c!.street} ${c!.number}, ${c!.postcode} ${c!.city}, ` +
          `email ${c!.email}. Nothing is sent until you press Submit.`,
      });
      return { ok: true, filled: fills.filter((f) => f.value).map((f) => f.field.id), awaiting: "user presses Submit" };
    }

    default:
      step("error", `Unknown tool ${name}`);
      return { error: `Unknown tool ${name}` };
  }
}
