import { test } from "node:test";
import assert from "node:assert/strict";
import { parseContact, parseExtraction } from "./schemas.ts";
import { checklistFor, isComplete } from "./profile.ts";

const passport = {
  kind: "passport",
  surname: "RAMAN",
  givenNames: "PRIYA",
  passportNumber: "X1234567",
  nationality: "INDIAN",
  dateOfBirth: "1996-03-14",
  placeOfBirth: "CHENNAI",
  dateOfExpiry: "2034-01-01",
  fatherName: "",
  permitNumber: "",
};

test("a passport parses, empty strings become missing optionals", () => {
  const r = parseExtraction(passport);
  assert.ok(r.ok);
  assert.equal(r.value.kind, "passport");
  assert.equal("fatherName" in r.value, false);
});

test("missing or badly formatted fields are errors, not crashes", () => {
  const r = parseExtraction({ ...passport, dateOfBirth: "14/03/1996" });
  assert.equal(r.ok, false);
  assert.equal(parseExtraction({ kind: "passport" }).ok, false);
  assert.equal(parseExtraction("nonsense").ok, false);
});

test("'other' documents are refused with a readable reason", () => {
  const r = parseExtraction({ kind: "other" });
  assert.ok(!r.ok);
  assert.match(r.error, /passport or a residence permit/);
});

test("a residence permit parses", () => {
  const r = parseExtraction({ kind: "residence_permit", surname: "RAMAN", givenNames: "PRIYA", permitNumber: "RP0004217", dateOfExpiry: "2028-10-19" });
  assert.ok(r.ok);
});

test("contact details validate postcode, email and mobile", () => {
  const good = { street: "Ermou", number: "10", postcode: "105 63", city: "Athens", email: "priya@example.com", mobile: "+30 690 000 0000" };
  assert.ok(parseContact(good).ok);
  assert.equal(parseContact({ ...good, postcode: "1056" }).ok, false);
  assert.equal(parseContact({ ...good, email: "nope" }).ok, false);
});

test("checklist moves items from needFromYou to have as the profile fills", () => {
  const empty = checklistFor({});
  assert.equal(empty.have.length, 0);
  assert.equal(empty.needFromYou.length, 4);
  const p = parseExtraction(passport);
  assert.ok(p.ok && p.value.kind === "passport");
  const half = checklistFor({ passport: p.value });
  assert.equal(half.have.length, 1);
  assert.equal(half.needFromYou.length, 3);
  assert.equal(isComplete({ passport: p.value }), false);
});
