// Hand-written procedure data for the AFM (Greek TIN) application of a non-EU tax resident.
// Source: AADE Registry Procedures Guide v1.2 (June 2026), §3.1.2, pp. 10–12. No RAG: edit by hand.

export const AFM_PROCEDURE_ID = "afm_tax_resident_foreign";

export type FieldType = "text" | "date" | "select" | "file";

export type SelectOption = { value: string; labelEl: string };

export type FormField = {
  id: string;
  labelEl: string;
  type: FieldType;
  options?: SelectOption[];
  explanationEn: string;
};

export type RequiredDocument = {
  id: "passport" | "residence_permit" | "marriage_certificate";
  nameEn: string;
  required: "always" | "if_applicable";
  note?: string;
};

export type IdentificationOption = {
  id: "myaadelive_appointment" | "direct_video_call" | "tax_office_visit";
  nameEn: string;
  descriptionEn: string;
};

export type Procedure = {
  id: typeof AFM_PROCEDURE_ID;
  titleEn: string;
  whyEn: string;
  steps: string[];
  requiredDocuments: RequiredDocument[];
  gotchas: string[];
  identificationOptions: IdentificationOption[];
  result: string;
  fields: FormField[];
  source: { title: string; section: string; pages: [number, number]; url: string };
};

export const afmProcedure: Procedure = {
  id: AFM_PROCEDURE_ID,
  titleEn: "Get a Greek tax number (AFM) as a foreign tax resident",
  whyEn:
    "Your employer cannot put you on payroll, and you cannot open a bank account or sign a lease, without a Greek tax number (AFM).",
  steps: [
    "Apply yourself, online only, in myAADE. No tax representative is needed (that is the non-resident path).",
    "Fill in your personal details and your Greek home address; the address decides your competent Tax Office / KEFODE.",
    "Upload your passport and your valid residence permit (plus a marriage or partnership certificate if applicable).",
    "Submit the application.",
    "Confirm your identity: book a myAADElive video call, take a direct video call with the first available agent, or visit a tax office.",
    "Receive your TIN certificate and Authentication Key (κλειδάριθμος) by email, in an encrypted file.",
  ],
  requiredDocuments: [
    { id: "passport", nameEn: "Passport (identification document)", required: "always" },
    { id: "residence_permit", nameEn: "Valid residence permit (non-EU nationals)", required: "always" },
    {
      id: "marriage_certificate",
      nameEn: "Marriage or civil partnership certificate",
      required: "if_applicable",
      note: "With apostille and an official Greek translation.",
    },
  ],
  gotchas: [
    "If you only hold a type-D visa while your permit card is pending, note that the guide asks for a valid residence permit.",
  ],
  identificationOptions: [
    {
      id: "myaadelive_appointment",
      nameEn: "myAADElive appointment",
      descriptionEn: "Book a video-call slot with AADE and join it with your passport.",
    },
    {
      id: "direct_video_call",
      nameEn: "Direct video call",
      descriptionEn: "Join a video call with the first available AADE agent, no booking.",
    },
    {
      id: "tax_office_visit",
      nameEn: "Tax office visit",
      descriptionEn: "Go in person to your competent tax office with your passport.",
    },
  ],
  result: "TIN certificate and Authentication Key (κλειδάριθμος), sent by email in an encrypted file.",
  fields: [
    {
      id: "surname",
      labelEl: "Επώνυμο (λατινικοί χαρακτήρες)",
      type: "text",
      explanationEn: "Your surname in Latin letters, exactly as printed on your passport.",
    },
    {
      id: "given_name",
      labelEl: "Όνομα (λατινικοί χαρακτήρες)",
      type: "text",
      explanationEn: "Your first name(s) in Latin letters, exactly as printed on your passport.",
    },
    {
      id: "father_name",
      labelEl: "Όνομα πατέρα",
      type: "text",
      explanationEn: "Your father's first name. Greek records use it to tell apart people with the same name.",
    },
    {
      id: "mother_name",
      labelEl: "Όνομα μητέρας",
      type: "text",
      explanationEn: "Your mother's first name, also used to identify you.",
    },
    {
      id: "date_of_birth",
      labelEl: "Ημερομηνία γέννησης",
      type: "date",
      explanationEn: "Your date of birth, as on your passport.",
    },
    {
      id: "place_of_birth",
      labelEl: "Τόπος γέννησης",
      type: "text",
      explanationEn: "The city and country where you were born, as on your passport.",
    },
    {
      id: "nationality",
      labelEl: "Υπηκοότητα",
      type: "select",
      options: [
        { value: "IN", labelEl: "Ινδία" },
        { value: "US", labelEl: "Ηνωμένες Πολιτείες" },
        { value: "GB", labelEl: "Ηνωμένο Βασίλειο" },
        { value: "CN", labelEl: "Κίνα" },
        { value: "PH", labelEl: "Φιλιππίνες" },
        { value: "OTHER", labelEl: "Άλλη" },
      ],
      explanationEn: "The country that issued your passport.",
    },
    {
      id: "passport_number",
      labelEl: "Αριθμός διαβατηρίου",
      type: "text",
      explanationEn: "The passport number from the photo page of your passport.",
    },
    {
      id: "passport_expiry",
      labelEl: "Ημερομηνία λήξης διαβατηρίου",
      type: "date",
      explanationEn: "The date your passport expires.",
    },
    {
      id: "residence_permit_number",
      labelEl: "Αριθμός άδειας διαμονής",
      type: "text",
      explanationEn: "The number on your Greek residence permit card.",
    },
    {
      id: "residence_permit_expiry",
      labelEl: "Ημερομηνία λήξης άδειας διαμονής",
      type: "date",
      explanationEn: "The date your residence permit expires. It must still be valid.",
    },
    {
      id: "address_street",
      labelEl: "Οδός",
      type: "text",
      explanationEn: "The street of your home in Greece. Your address decides which tax office handles you.",
    },
    {
      id: "address_number",
      labelEl: "Αριθμός",
      type: "text",
      explanationEn: "The building number of your home address.",
    },
    {
      id: "address_postcode",
      labelEl: "Ταχυδρομικός κώδικας",
      type: "text",
      explanationEn: "Your five-digit Greek postcode.",
    },
    {
      id: "address_city",
      labelEl: "Πόλη",
      type: "text",
      explanationEn: "The city or town you live in, for example Athens.",
    },
    {
      id: "email",
      labelEl: "Διεύθυνση ηλεκτρονικού ταχυδρομείου (email)",
      type: "text",
      explanationEn: "Your email. Your tax number and Authentication Key will be sent here.",
    },
    {
      id: "mobile",
      labelEl: "Κινητό τηλέφωνο",
      type: "text",
      explanationEn: "Your mobile number, with country code, so AADE can reach you.",
    },
    {
      id: "upload_passport",
      labelEl: "Επισύναψη διαβατηρίου",
      type: "file",
      explanationEn: "A clear photo or scan of your passport's photo page.",
    },
    {
      id: "upload_residence_permit",
      labelEl: "Επισύναψη άδειας διαμονής",
      type: "file",
      explanationEn: "A photo or scan of both sides of your residence permit card.",
    },
    {
      id: "upload_marriage_certificate",
      labelEl: "Επισύναψη πιστοποιητικού γάμου / συμφώνου συμβίωσης (εφόσον υπάρχει)",
      type: "file",
      explanationEn:
        "Only if you are married or in a civil partnership: the certificate with apostille and official Greek translation.",
    },
  ],
  source: {
    title: "AADE Registry Procedures Guide v1.2 (June 2026)",
    section: "§3.1.2 Issuance of TIN & Authentication Key to foreign nationals who are tax residents of Greece",
    pages: [10, 12],
    url: "https://aade.gr/sites/default/files/2026-06/REGISTRY%20PROCEDURES%20GUIDE.pdf",
  },
};

export type ProcedureResult = { ok: true; procedure: Procedure } | { ok: false; error: string };

export function getProcedure(id: string): ProcedureResult {
  if (id === AFM_PROCEDURE_ID) return { ok: true, procedure: afmProcedure };
  return { ok: false, error: `Unknown procedure id: ${id}` };
}
