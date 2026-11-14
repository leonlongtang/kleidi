"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Message } from "../../lib/events";

type Props = {
  messages: Message[];
  onSend: (text: string, images: string[]) => void;
  /** Changes whenever new content appears, to trigger auto-scroll. */
  scrollKey: string;
  /** Cards rendered after the messages (checklist, submit, confirmation). */
  children?: ReactNode;
};

export default function Chat({ messages, onSend, scrollKey, children }: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [scrollKey]);

  const send = () => {
    if (!text.trim() && images.length === 0) return;
    onSend(text.trim(), images);
    setText("");
    setImages([]);
  };

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}>
            {m.images && m.images.length > 0 && (
              <div className="mb-1 flex gap-1">
                {m.images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob: URLs
                  <img key={src} src={src} alt="Uploaded document" className="h-20 rounded border object-cover" />
                ))}
              </div>
            )}
            {m.text && (
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  m.from === "user" ? "bg-blue-600 text-white" : "border border-zinc-200 bg-white"
                }`}
              >
                {m.text}
              </p>
            )}
          </div>
        ))}
        {children}
        <div ref={bottom} />
      </div>

      <form
        className="border-t border-zinc-200 bg-white p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        {images.length > 0 && (
          <div className="mb-2 flex gap-2">
            {images.map((src) => (
              <div key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URLs */}
                <img src={src} alt="Document to send" className="h-16 w-16 rounded border object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => {
                    URL.revokeObjectURL(src);
                    setImages((xs) => xs.filter((x) => x !== src));
                  }}
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-zinc-800 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture
            multiple
            className="hidden"
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              // data URLs, not blob: URLs, so the server can read them
              const urls = await Promise.all(
                files.map(
                  (f) =>
                    new Promise<string>((resolve, reject) => {
                      const r = new FileReader();
                      r.onload = () => resolve(String(r.result));
                      r.onerror = () => reject(r.error);
                      r.readAsDataURL(f);
                    }),
                ),
              );
              setImages((xs) => [...xs, ...urls]);
            }}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="rounded-md border border-zinc-300 px-3 text-sm hover:bg-zinc-100"
          >
            📎 Photo
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-md bg-zinc-900 px-4 text-sm font-medium text-white">
            Send
          </button>
        </div>
      </form>
    </>
  );
}
