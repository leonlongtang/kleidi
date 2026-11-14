import type { Checklist } from "../../lib/events";

const sections = [
  { key: "have", title: "Have", mark: "✓", tone: "text-green-700" },
  { key: "needFromYou", title: "Need from you", mark: "○", tone: "text-amber-700" },
  { key: "youllDo", title: "You'll do", mark: "→", tone: "text-blue-700" },
] as const;

export default function ChecklistCard({ checklist }: { checklist: Checklist }) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-sm">
      {sections.map(({ key, title, mark, tone }) => (
        <div key={key}>
          <p className={`mb-1 font-medium ${tone}`}>{title}</p>
          <ul className="space-y-1">
            {checklist[key].map((item) => (
              <li key={item} className="flex gap-1">
                <span className={tone}>{mark}</span>
                <span>{item}</span>
              </li>
            ))}
            {checklist[key].length === 0 && <li className="text-zinc-400">Nothing</li>}
          </ul>
        </div>
      ))}
    </div>
  );
}
