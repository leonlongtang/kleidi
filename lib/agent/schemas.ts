// What the agent knows about the user, validated with zod. Model output never reaches the profile unvalidated.
import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");
const text = z.string().trim().min(1);

export const Passport = z.object({
  kind: z.literal("passport"),
  surname: text,
  givenNames: text,
  passportNumber: text,
  nationality: text,
  dateOfBirth: isoDate,
  placeOfBirth: text,
  dateOfExpiry: isoDate,
  fatherName: text.optional(),
  motherName: text.optional(),
});
export type Passport = z.infer<typeof Passport>;

export const ResidencePermit = z.object({
  kind: z.literal("residence_permit"),
  surname: text,
  givenNames: text,
  permitNumber: text,
  dateOfExpiry: isoDate,
});
export type ResidencePermit = z.infer<typeof ResidencePermit>;

export const ExtractedDocument = z.discriminatedUnion("kind", [Passport, ResidencePermit]);
export type ExtractedDocument = z.infer<typeof ExtractedDocument>;

/** Flat shape Gemini fills (simpler for the model than a union); parsed into ExtractedDocument afterwards. */
export const ExtractionJsonSchema = {
  type: "object",
  properties: {
    kind: { type: "string", enum: ["passport", "residence_permit", "other"] },
    surname: { type: "string" },
    givenNames: { type: "string" },
    passportNumber: { type: "string" },
    permitNumber: { type: "string" },
    nationality: { type: "string" },
    dateOfBirth: { type: "string", description: "YYYY-MM-DD" },
    placeOfBirth: { type: "string" },
    dateOfExpiry: { type: "string", description: "YYYY-MM-DD" },
    fatherName: { type: "string" },
    motherName: { type: "string" },
  },
  required: ["kind"],
};

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseExtraction(raw: unknown): Parsed<ExtractedDocument> {
  if (raw && typeof raw === "object" && (raw as { kind?: unknown }).kind === "other") {
    return { ok: false, error: "This doesn't look like a passport or a residence permit." };
  }
  // Drop empty strings the model uses for "not on the document", so optional fields stay optional.
  const cleaned =
    raw && typeof raw === "object"
      ? Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== "" && v !== null))
      : raw;
  const r = ExtractedDocument.safeParse(cleaned);
  return r.success ? { ok: true, value: r.data } : { ok: false, error: z.prettifyError(r.error) };
}

export const ContactDetails = z.object({
  street: text,
  number: text,
  postcode: z.string().regex(/^\d{3} ?\d{2}$/, "Greek postcodes have 5 digits"),
  city: text,
  email: z.email(),
  mobile: z.string().regex(/^\+?[\d ]{8,16}$/, "mobile number with country code"),
});
export type ContactDetails = z.infer<typeof ContactDetails>;

export function parseContact(raw: unknown): Parsed<ContactDetails> {
  const r = ContactDetails.safeParse(raw);
  return r.success ? { ok: true, value: r.data } : { ok: false, error: z.prettifyError(r.error) };
}
