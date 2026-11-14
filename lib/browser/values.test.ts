import { test } from "node:test";
import assert from "node:assert/strict";
import { afmProcedure } from "../procedure/afm.ts";
import { fieldFills, nationalityCode } from "./values.ts";

const profile = {
  passport: {
    kind: "passport" as const,
    surname: "SHARMA",
    givenNames: "PRIYA",
    passportNumber: "S0000000",
    nationality: "Indian",
    dateOfBirth: "1996-03-14",
    placeOfBirth: "CHENNAI",
    dateOfExpiry: "2034-01-01",
  },
  permit: { kind: "residence_permit" as const, surname: "SHARMA", givenNames: "PRIYA", permitNumber: "RP1", dateOfExpiry: "2027-11-01" },
  contact: { street: "Ermou", number: "10", postcode: "105 63", city: "Athens", email: "p@example.com", mobile: "+30 690 000 0000" },
};

test("every procedure field gets exactly one fill, in form order", () => {
  const fills = fieldFills(profile);
  assert.deepEqual(fills.map((f) => f.field.id), afmProcedure.fields.map((f) => f.id));
});

test("values come from the profile; missing optionals and the marriage certificate stay empty", () => {
  const v = Object.fromEntries(fieldFills(profile).map((f) => [f.field.id, f.value]));
  assert.equal(v.surname, "SHARMA");
  assert.equal(v.nationality, "IN");
  assert.equal(v.address_postcode, "10563");
  assert.equal(v.upload_passport, "passport");
  assert.equal(v.father_name, "");
  assert.equal(v.upload_marriage_certificate, "");
});

test("nationality maps to a select option or OTHER", () => {
  assert.equal(nationalityCode(" ind "), "IN");
  assert.equal(nationalityCode("Kenyan"), "OTHER");
  const opts = afmProcedure.fields.find((f) => f.id === "nationality")!.options!.map((o) => o.value);
  for (const c of ["IN", "US", "GB", "CN", "PH", "OTHER"]) assert.ok(opts.includes(c));
});
