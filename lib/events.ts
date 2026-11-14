// Events streamed from the server (SSE) to the Kleidi page, and the reducer that turns them into UI state.

export type StepStatus = "running" | "done" | "error";

export type KleidiEvent =
  | { type: "message"; text: string }
  | { type: "checklist"; have: string[]; needFromYou: string[]; youllDo: string[] }
  | {
      type: "step";
      /** Same id = update of an earlier step (e.g. running → done). */
      id: string;
      tool: string;
      status: StepStatus;
      labelGreek?: string;
      explanation: string;
      value?: string;
    }
  | { type: "awaitingSubmit"; summary: string }
  | { type: "done"; confirmation: string; icsUrl?: string };

export type StepEvent = Extract<KleidiEvent, { type: "step" }>;
export type Checklist = Omit<Extract<KleidiEvent, { type: "checklist" }>, "type">;

export type Message = { from: "agent" | "user"; text: string; images?: string[] };

export type UiState = {
  messages: Message[];
  checklist: Checklist | null;
  steps: StepEvent[];
  latestStepId: string | null;
  awaitingSubmit: string | null;
  done: { confirmation: string; icsUrl?: string } | null;
};

export const initialState: UiState = {
  messages: [],
  checklist: null,
  steps: [],
  latestStepId: null,
  awaitingSubmit: null,
  done: null,
};

export function applyEvent(state: UiState, event: KleidiEvent): UiState {
  switch (event.type) {
    case "message":
      return { ...state, messages: [...state.messages, { from: "agent", text: event.text }] };
    case "checklist": {
      const { have, needFromYou, youllDo } = event;
      return { ...state, checklist: { have, needFromYou, youllDo } };
    }
    case "step": {
      const exists = state.steps.some((s) => s.id === event.id);
      const steps = exists
        ? state.steps.map((s) => (s.id === event.id ? event : s))
        : [...state.steps, event];
      return { ...state, steps, latestStepId: event.id };
    }
    case "awaitingSubmit":
      return { ...state, awaitingSubmit: event.summary };
    case "done":
      return {
        ...state,
        awaitingSubmit: null,
        done: { confirmation: event.confirmation, icsUrl: event.icsUrl },
      };
  }
}

const DEMO_ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Kleidi//demo//EN",
  "BEGIN:VEVENT",
  "UID:kleidi-demo@kleidi",
  "DTSTAMP:20261114T120000Z",
  "DTSTART:20261116T080000Z",
  "DTEND:20261116T081500Z",
  "SUMMARY:myAADElive video call (AFM identification)",
  "DESCRIPTION:Have your passport ready.",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

const fill = (
  id: string,
  labelGreek: string,
  explanation: string,
  value: string,
): KleidiEvent[] => [
  { type: "step", id, tool: "fill_application", status: "running", labelGreek, explanation, value },
  { type: "step", id, tool: "fill_application", status: "done", labelGreek, explanation, value },
];

/** Hard-coded sequence for `/?demo`, so the UI can be shown without Gemini. Specimen data only. */
export const DEMO_EVENTS: { delayMs: number; event: KleidiEvent }[] = [
  {
    delayMs: 600,
    event: {
      type: "message",
      text: "Welcome to Greece! To get paid you first need an AFM, the Greek tax number every employer needs for payroll. Upload photos of your passport and residence permit and I'll handle the rest.",
    },
  },
  { delayMs: 1200, event: { type: "step", id: "x1", tool: "extract_document", status: "running", explanation: "Reading your passport" } },
  { delayMs: 1200, event: { type: "step", id: "x1", tool: "extract_document", status: "done", explanation: "Passport read", value: "SPECIMEN · SHARMA, PRIYA" } },
  { delayMs: 600, event: { type: "step", id: "x2", tool: "extract_document", status: "running", explanation: "Reading your residence permit" } },
  { delayMs: 1200, event: { type: "step", id: "x2", tool: "extract_document", status: "done", explanation: "Residence permit read", value: "SPECIMEN · valid to 2027-11-01" } },
  { delayMs: 600, event: { type: "step", id: "p1", tool: "get_procedure", status: "done", explanation: "AADE Registry Procedures Guide §3.1.2, pp. 10–12" } },
  {
    delayMs: 600,
    event: {
      type: "checklist",
      have: ["Passport", "Residence permit"],
      needFromYou: ["Greek home address (decides your tax office)", "Email", "Phone number"],
      youllDo: ["Join the myAADElive video call with your passport"],
    },
  },
  {
    delayMs: 800,
    event: {
      type: "message",
      text: "You have both documents. What's your address in Greece? It decides which tax office handles your file. (If you only have a type-D visa so far, note that AADE asks for a valid residence permit.)",
    },
  },
  ...[
    ...fill("f1", "Επώνυμο", "Surname, exactly as in your passport", "SHARMA"),
    ...fill("f2", "Όνομα", "First name", "PRIYA"),
    ...fill("f3", "Υπηκοότητα", "Nationality", "Ινδία (India)"),
    ...fill("f4", "Αριθμός διαβατηρίου", "Passport number", "S0000000"),
    ...fill("f5", "Διεύθυνση κατοικίας", "Home address in Greece", "Ερμού 10, 10563 Αθήνα"),
    ...fill("f6", "Αρμόδια ΔΟΥ", "Your tax office, set by your address", "ΚΕΦΟΔΕ Αττικής"),
    ...fill("f7", "Συνημμένα", "Attached documents", "passport.jpg, permit.jpg"),
  ].map((event) => ({ delayMs: 700, event })),
  {
    delayMs: 800,
    event: {
      type: "awaitingSubmit",
      summary:
        "Application for an AFM as a foreign tax resident (§3.1.2): Priya Sharma, Indian national, passport and residence permit attached, address Ermou 10, Athens → KEFODE Attica. Nothing is sent until you press Submit.",
    },
  },
  {
    delayMs: 0,
    event: {
      type: "done",
      confirmation:
        "Submitted. Your myAADElive video call is booked for Mon 16 Nov, 10:00. Bring your passport; your AFM and Authentication Key arrive by email afterwards.",
      icsUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(DEMO_ICS)}`,
    },
  },
];
