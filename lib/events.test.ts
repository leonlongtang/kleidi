import { test } from "node:test";
import assert from "node:assert/strict";
import { addUserMessage, applyEvent, initialState, DEMO_EVENTS, type KleidiEvent } from "./events.ts";

const run = (events: KleidiEvent[]) => events.reduce(applyEvent, initialState);

test("message events append agent messages", () => {
  const s = run([
    { type: "message", text: "Hi" },
    { type: "message", text: "You need an AFM." },
  ]);
  assert.deepEqual(
    s.messages.map((m) => m.text),
    ["Hi", "You need an AFM."],
  );
  assert.ok(s.messages.every((m) => m.from === "agent"));
});

test("checklist event replaces the checklist", () => {
  const s = run([
    { type: "checklist", have: ["a"], needFromYou: ["b"], youllDo: ["c"] },
    { type: "checklist", have: ["a", "b"], needFromYou: [], youllDo: ["c"] },
  ]);
  assert.deepEqual(s.checklist, { have: ["a", "b"], needFromYou: [], youllDo: ["c"] });
});

test("step with the same id updates in place, a new id appends", () => {
  const base = { tool: "fill_application", explanation: "x", value: "v" };
  const s = run([
    { type: "step", id: "1", status: "running", labelGreek: "Επώνυμο", ...base },
    { type: "step", id: "2", status: "running", labelGreek: "Όνομα", ...base },
    { type: "step", id: "1", status: "done", labelGreek: "Επώνυμο", ...base },
  ]);
  assert.deepEqual(
    s.steps.map((x) => [x.id, x.status]),
    [
      ["1", "done"],
      ["2", "running"],
    ],
  );
  assert.equal(s.latestStepId, "1");
});

test("awaitingSubmit sets the summary; done clears it and keeps the ics url", () => {
  let s = run([{ type: "awaitingSubmit", summary: "Ready" }]);
  assert.equal(s.awaitingSubmit, "Ready");
  s = applyEvent(s, { type: "done", confirmation: "Booked", icsUrl: "/slot.ics" });
  assert.equal(s.awaitingSubmit, null);
  assert.deepEqual(s.done, { confirmation: "Booked", icsUrl: "/slot.ics" });
});

test("addUserMessage keeps images and interleaves with agent messages", () => {
  const s = addUserMessage(run([{ type: "message", text: "Hi" }]), "Hello", ["blob:1"]);
  const s2 = applyEvent(s, { type: "message", text: "Welcome" });
  assert.deepEqual(
    s2.messages.map((m) => m.from),
    ["agent", "user", "agent"],
  );
  assert.deepEqual(s2.messages[1].images, ["blob:1"]);
});

test("demo sequence covers every event type and ends with an ics link", () => {
  const types = new Set(DEMO_EVENTS.map((e) => e.event.type));
  for (const t of ["message", "checklist", "step", "awaitingSubmit", "done"] as const) {
    assert.ok(types.has(t), t);
  }
  const s = run(DEMO_EVENTS.map((e) => e.event));
  assert.ok(s.done?.icsUrl);
});
