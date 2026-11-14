import type { Content } from "@google/genai";
import type { Profile } from "./profile.ts";

export type Image = { mimeType: string; data: string };
export type Session = { history: Content[]; profile: Profile; images: Map<string, Image>; steps: number };

// ponytail: in-memory, one process, lost on restart. Fine for a single-user demo; use a store if it ever has users.
const g = globalThis as unknown as { kleidiSessions?: Map<string, Session> };
const sessions = (g.kleidiSessions ??= new Map());

export function getSession(id: string): Session {
  let s = sessions.get(id);
  if (!s) {
    s = { history: [], profile: {}, images: new Map(), steps: 0 };
    sessions.set(id, s);
  }
  return s;
}
