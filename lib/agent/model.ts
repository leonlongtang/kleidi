import { GoogleGenAI } from "@google/genai";

/** The one place the model id lives. */
export const MODEL = "gemini-3.8-flash";

let client: GoogleGenAI | undefined;

export function ai(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set (put it in .env.local)");
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}
