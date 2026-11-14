import { test } from "node:test";
import assert from "node:assert/strict";
import { getProcedure, AFM_PROCEDURE_ID } from "./afm.ts";

function load() {
  const result = getProcedure(AFM_PROCEDURE_ID);
  assert.ok(result.ok, "known id should resolve");
  return result.procedure;
}

test("getProcedure returns the AFM procedure for its id", () => {
  const p = load();
  assert.equal(p.id, "afm_tax_resident_foreign");
  assert.match(p.source.section, /3\.1\.2/);
  assert.deepEqual(p.source.pages, [10, 12]);
});

test("unknown id returns an error value instead of throwing", () => {
  const result = getProcedure("no_such_procedure");
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /no_such_procedure/);
});

test("every field has a Greek label and an English explanation", () => {
  for (const f of load().fields) {
    assert.match(f.labelEl, /[Ͱ-Ͽ]/, `${f.id} needs a Greek label`);
    assert.ok(f.explanationEn.trim().length > 0, `${f.id} needs an explanation`);
    assert.doesNotMatch(f.explanationEn, /[Ͱ-Ͽ]{4,}/, `${f.id} explanation should be English`);
  }
});

test("field ids are unique", () => {
  const ids = load().fields.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("select fields have Greek options; other fields have none", () => {
  for (const f of load().fields) {
    if (f.type === "select") {
      assert.ok(f.options && f.options.length > 0, `${f.id} needs options`);
      for (const o of f.options) assert.match(o.labelEl, /[Ͱ-Ͽ]/);
    } else {
      assert.equal(f.options, undefined, `${f.id} should not have options`);
    }
  }
});

test("required documents and identification options are present", () => {
  const p = load();
  assert.deepEqual(
    p.requiredDocuments.map((d) => d.id),
    ["passport", "residence_permit", "marriage_certificate"],
  );
  assert.equal(p.requiredDocuments.find((d) => d.id === "marriage_certificate")?.required, "if_applicable");
  assert.deepEqual(
    p.identificationOptions.map((o) => o.id),
    ["myaadelive_appointment", "direct_video_call", "tax_office_visit"],
  );
});
