import { test } from "node:test";
import assert from "node:assert/strict";
import { takeEvents } from "./sse.ts";

test("complete frames become events, a partial frame waits in rest", () => {
  const a = JSON.stringify({ type: "message", text: "hi" });
  const b = JSON.stringify({ type: "message", text: "there" });
  const { events, rest } = takeEvents(`data: ${a}\n\ndata: ${b.slice(0, 10)}`);
  assert.deepEqual(events, [{ type: "message", text: "hi" }]);
  const second = takeEvents(rest + `${b.slice(10)}\n\n`);
  assert.deepEqual(second.events, [{ type: "message", text: "there" }]);
  assert.equal(second.rest, "");
});
