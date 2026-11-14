// Shared shapes for a hire case. Every ticket builds on these; change them here only.
import { z } from "zod";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM");

export const Weekday = z.enum(["mon", "tue", "wed", "thu", "fri"]);
export const EmploymentType = z.enum(["full", "part-time"]);

/** What the client asked for, parsed from the voice note (Greek or English). */
export const HireRequest = z.object({
  employeeName: z.string().min(1),
  startDay: Weekday,
  startTime: hhmm.optional(),
  employmentType: EmploymentType,
  hoursPerWeek: z.number().positive().max(40).optional(),
  notes: z.string(),
  language: z.enum(["el", "en"]),
});
export type HireRequest = z.infer<typeof HireRequest>;

/** What the passport says (vision extraction or MRZ). */
export const PassportData = z.object({
  surname: z.string().min(1),
  givenNames: z.string().min(1),
  nationality: z.string().length(3), // ISO 3166-1 alpha-3, as in the MRZ
  dateOfBirth: ymd,
  sex: z.enum(["F", "M", "X"]),
  passportNumber: z.string().min(1),
  expiryDate: ymd,
});
export type PassportData = z.infer<typeof PassportData>;

/** What the employment contract says. */
export const ContractData = z.object({
  employeeName: z.string().min(1),
  employer: z.string().min(1),
  role: z.string().min(1),
  startDate: ymd,
  employmentType: EmploymentType,
  hoursPerWeek: z.number().positive().max(40),
  grossMonthlyEur: z.number().positive(),
});
export type ContractData = z.infer<typeof ContractData>;

/** The checked record that goes into payroll; the DB row is verified against it. */
export const EmployeeRecord = z.object({
  surname: z.string().min(1),
  givenNames: z.string().min(1),
  dateOfBirth: ymd,
  nationality: z.string().length(3),
  passportNumber: z.string().min(1),
  role: z.string().min(1),
  startDate: ymd,
  startTime: hhmm,
  employmentType: EmploymentType,
  hoursPerWeek: z.number().positive().max(40),
  grossMonthlyEur: z.number().positive(),
  afm: z.string().nullable(),
  amka: z.string().nullable(),
  iban: z.string().nullable(),
});
export type EmployeeRecord = z.infer<typeof EmployeeRecord>;
