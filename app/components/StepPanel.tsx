"use client";

import { useEffect, useRef } from "react";
import type { StepEvent } from "../../lib/events";

const statusIcon = { running: "⏳", done: "✓", error: "✕" } as const;

type Props = { steps: StepEvent[]; latestStepId: string | null };

export default function StepPanel({ steps, latestStepId }: Props) {
  const latest = useRef<HTMLLIElement>(null);

  useEffect(() => {
    latest.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [latestStepId, steps]);

  return (
    <aside className="flex min-w-0 flex-[2] flex-col bg-white">
      <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold">What the agent is doing</h2>
      {steps.length === 0 && <p className="p-4 text-sm text-zinc-400">Nothing yet.</p>}
      <ol className="flex-1 space-y-2 overflow-y-auto p-3">
        {steps.map((s) => {
          const isLatest = s.id === latestStepId;
          return (
            <li
              key={s.id}
              ref={isLatest ? latest : undefined}
              className={`rounded-md border p-2 text-sm transition-colors ${
                isLatest ? "border-blue-400 bg-blue-50 shadow-sm" : "border-zinc-200"
              } ${s.status === "error" ? "border-red-300 bg-red-50" : ""}`}
            >
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className={s.status === "running" ? "animate-pulse" : ""}>{statusIcon[s.status]}</span>
                <span className="font-mono">{s.tool}</span>
              </div>
              {s.labelGreek && <p className="mt-1 font-medium" lang="el">{s.labelGreek}</p>}
              <p className="text-zinc-700">{s.explanation}</p>
              {s.value && <p className="mt-1 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">{s.value}</p>}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
