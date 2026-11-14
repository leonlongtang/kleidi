// The scripted Priya case: the "truth" every ticket tests against. Specimen data, invented.
import type { ContractData, EmployeeRecord, HireRequest, PassportData } from "./types.ts";

/** Friday evening in Athens, when the client's voice note arrives. Override per demo run. */
export const DEMO_NOW = "2026-11-13T19:00:00+02:00";

export const PRIYA_VOICE_NOTE_EL = "Προσλάβαμε την Πρίγια από Δευτέρα, κάνε ό,τι χρειάζεται";

export const PRIYA_REQUEST: HireRequest = {
  employeeName: "Priya",
  startDay: "mon",
  employmentType: "full",
  notes: "",
  language: "el",
};

export const PRIYA_PASSPORT: PassportData = {
  surname: "RAMAN",
  givenNames: "PRIYA",
  nationality: "ITA",
  dateOfBirth: "1996-03-14",
  sex: "F",
  passportNumber: "YA1234567",
  expiryDate: "2034-01-01",
};

/** TD3 machine-readable zone for PRIYA_PASSPORT, ICAO 9303 check digits (computed once, verified in lib/check). */
export const PRIYA_MRZ = [
  "P<ITARAMAN<<PRIYA<<<<<<<<<<<<<<<<<<<<<<<<<<<",
  "YA12345676ITA9603149F3401011<<<<<<<<<<<<<<<2",
] as const;

/** The planted mismatch: the contract misspells her surname. */
export const PRIYA_CONTRACT: ContractData = {
  employeeName: "Priya Ramann",
  employer: "Limani Software IKE",
  role: "Software engineer",
  startDate: "2026-11-16",
  employmentType: "full",
  hoursPerWeek: 40,
  grossMonthlyEur: 1450,
};

/** What payroll should hold after checks: passport wins on identity, the request on start terms. */
export const PRIYA_RECORD: EmployeeRecord = {
  surname: "RAMAN",
  givenNames: "PRIYA",
  dateOfBirth: "1996-03-14",
  nationality: "ITA",
  passportNumber: "YA1234567",
  role: "Software engineer",
  startDate: "2026-11-17", // earliest legal start: Tuesday, not the requested Monday
  startTime: "09:00",
  employmentType: "full",
  hoursPerWeek: 40,
  grossMonthlyEur: 1450,
  afm: null,
  amka: null,
  iban: null,
};
