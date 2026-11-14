// Profile → the value for every mock-portal field. Pure, so it is tested without a browser.
import type { Profile } from "../agent/profile.ts";
import { afmProcedure, type FormField } from "../procedure/afm.ts";

/** `value` is what goes into the input (for files: the upload kind); `shown` is what the side panel displays. */
export type FieldFill = { field: FormField; value: string; shown: string };

const NATIONALITIES: Record<string, string[]> = {
  IN: ["IN", "IND", "INDIA", "INDIAN"],
  US: ["US", "USA", "UNITED STATES", "UNITED STATES OF AMERICA", "AMERICAN"],
  GB: ["GB", "GBR", "UNITED KINGDOM", "BRITISH"],
  CN: ["CN", "CHN", "CHINA", "CHINESE"],
  PH: ["PH", "PHL", "PHILIPPINES", "FILIPINO"],
};

export function nationalityCode(raw: string): string {
  const n = raw.trim().toUpperCase();
  return Object.keys(NATIONALITIES).find((code) => NATIONALITIES[code].includes(n)) ?? "OTHER";
}

export function fieldFills(p: Profile): FieldFill[] {
  const { passport: pp, permit, contact: c } = p;
  const nat = pp ? nationalityCode(pp.nationality) : "";
  const values: Record<string, string | undefined> = {
    surname: pp?.surname,
    given_name: pp?.givenNames,
    father_name: pp?.fatherName,
    mother_name: pp?.motherName,
    date_of_birth: pp?.dateOfBirth,
    place_of_birth: pp?.placeOfBirth,
    nationality: nat,
    passport_number: pp?.passportNumber,
    passport_expiry: pp?.dateOfExpiry,
    residence_permit_number: permit?.permitNumber,
    residence_permit_expiry: permit?.dateOfExpiry,
    address_street: c?.street,
    address_number: c?.number,
    address_postcode: c?.postcode.replace(" ", ""),
    address_city: c?.city,
    email: c?.email,
    mobile: c?.mobile,
    upload_passport: pp && "passport",
    upload_residence_permit: permit && "residence_permit",
    upload_marriage_certificate: undefined, // not applicable for Priya
  };
  return afmProcedure.fields.map((field) => {
    const value = values[field.id] ?? "";
    let shown = value || "— (left empty)";
    if (field.type === "select" && value) {
      shown = `${field.options?.find((o) => o.value === value)?.labelEl ?? value} (${pp?.nationality})`;
    }
    if (field.type === "file" && value) shown = `${value.replace("_", "-")} photo`;
    return { field, value, shown };
  });
}
