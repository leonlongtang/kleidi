// The user's profile and the checklist derived from it. The checklist is computed, never written by the model.
import type { Checklist } from "../events.ts";
import type { ContactDetails, Passport, ResidencePermit } from "./schemas.ts";

export type Profile = { passport?: Passport; permit?: ResidencePermit; contact?: ContactDetails };

export function checklistFor(p: Profile): Checklist {
  const have: string[] = [];
  const needFromYou: string[] = [];
  if (p.passport) have.push(`Passport (${p.passport.givenNames} ${p.passport.surname})`);
  else needFromYou.push("Photo of your passport");
  if (p.permit) have.push(`Residence permit (valid until ${p.permit.dateOfExpiry})`);
  else needFromYou.push("Photo of your residence permit");
  if (p.contact) {
    have.push(`Greek address (${p.contact.street} ${p.contact.number}, ${p.contact.city})`);
    have.push("Email and mobile");
  } else {
    needFromYou.push("Greek home address (decides your tax office)");
    needFromYou.push("Email and mobile number");
  }
  return { have, needFromYou, youllDo: ["Join the myAADElive video call with your passport"] };
}

export const isComplete = (p: Profile) => Boolean(p.passport && p.permit && p.contact);
