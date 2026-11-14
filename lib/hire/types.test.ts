import { test } from "node:test";
import assert from "node:assert/strict";
import { ContractData, EmployeeRecord, HireRequest, PassportData } from "./types.ts";
import { PRIYA_CONTRACT, PRIYA_PASSPORT, PRIYA_RECORD, PRIYA_REQUEST } from "./priya.ts";

test("the Priya fixture matches the shared schemas", () => {
  HireRequest.parse(PRIYA_REQUEST);
  PassportData.parse(PRIYA_PASSPORT);
  ContractData.parse(PRIYA_CONTRACT);
  EmployeeRecord.parse(PRIYA_RECORD);
});

test("guardrails: weekend starts and other contract types are refused", () => {
  assert.equal(HireRequest.safeParse({ ...PRIYA_REQUEST, startDay: "sat" }).success, false);
  assert.equal(HireRequest.safeParse({ ...PRIYA_REQUEST, employmentType: "freelance" }).success, false);
  assert.equal(HireRequest.safeParse({ ...PRIYA_REQUEST, startTime: "9am" }).success, false);
});
