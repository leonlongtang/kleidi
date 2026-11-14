"use client";

import { useEffect, useReducer, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { applyEvent, DEMO_EVENTS, initialState, type KleidiEvent, type UiState } from "../../lib/events";
import Chat from "./Chat";
import ChecklistCard from "./ChecklistCard";
import StepPanel from "./StepPanel";

type Action = { kind: "event"; event: KleidiEvent } | { kind: "user"; text: string; images: string[] };

function reducer(state: UiState, action: Action): UiState {
  if (action.kind === "event") return applyEvent(state, action.event);
  return { ...state, messages: [...state.messages, { from: "user", text: action.text, images: action.images }] };
}

const submitIndex = DEMO_EVENTS.findIndex((e) => e.event.type === "awaitingSubmit");

/** Plays DEMO_EVENTS[from..to) with their delays; returns a cancel function. */
function play(from: number, to: number, dispatch: (a: Action) => void) {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let at = 0;
  for (const { delayMs, event } of DEMO_EVENTS.slice(from, to)) {
    at += delayMs;
    timers.push(setTimeout(() => dispatch({ kind: "event", event }), at));
  }
  return () => timers.forEach(clearTimeout);
}

export default function Kleidi() {
  const demo = useSearchParams().has("demo");
  const [state, dispatch] = useReducer(reducer, initialState);
  const cancel = useRef<() => void>(() => {});

  useEffect(() => {
    if (!demo) return;
    // Play up to and including awaitingSubmit; the rest waits for the Submit click.
    cancel.current = play(0, submitIndex + 1, dispatch);
    return () => cancel.current();
  }, [demo]);

  const onSubmit = () => {
    // Until the orchestrator lands, only the demo knows what happens after Submit.
    if (demo) cancel.current = play(submitIndex + 1, DEMO_EVENTS.length, dispatch);
  };

  return (
    <div className="flex h-screen w-full max-w-[720px] bg-zinc-50 text-zinc-900">
      <main className="flex min-w-0 flex-[3] flex-col border-r border-zinc-200">
        <header className="flex items-baseline gap-2 border-b border-zinc-200 bg-white px-4 py-3">
          <span className="text-lg font-semibold">Kleidi</span>
          <span className="text-sm text-zinc-500">your Greek tax number, sorted</span>
          {demo && <span className="ml-auto rounded bg-amber-100 px-2 text-xs text-amber-800">demo</span>}
        </header>
        <Chat
          messages={state.messages}
          onSend={(text, images) => dispatch({ kind: "user", text, images })}
        >
          {state.checklist && <ChecklistCard checklist={state.checklist} />}
          {state.awaitingSubmit && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
              <p className="mb-2 font-medium">Ready to submit</p>
              <p className="mb-3">{state.awaitingSubmit}</p>
              <button
                onClick={onSubmit}
                className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          )}
          {state.done && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
              <p className="mb-2">{state.done.confirmation}</p>
              {state.done.icsUrl && (
                <a
                  href={state.done.icsUrl}
                  download="myaadelive-appointment.ics"
                  className="font-medium text-green-800 underline"
                >
                  Add to calendar (.ics)
                </a>
              )}
            </div>
          )}
        </Chat>
      </main>
      <StepPanel steps={state.steps} latestStepId={state.latestStepId} />
    </div>
  );
}
