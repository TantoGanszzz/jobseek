"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Paperclip, Search, Send } from "lucide-react";
import { Avatar } from "@/components/demo/ui";
import { demoConversations, type DemoConversation } from "@/lib/demo/data";
import { cn } from "@/lib/utils/cn";

type Thread = DemoConversation;

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(() =>
    demoConversations.map((c) => ({ ...c, messages: c.messages.map((m) => ({ ...m })) }))
  );
  const [activeId, setActiveId] = useState<string | null>(threads[0]?.id ?? null);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");

  const active = threads.find((t) => t.id === activeId) ?? null;

  const visible = threads.filter((t) => {
    if (!query.trim()) return true;
    return `${t.name} ${t.messages.map((m) => m.text).join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  function send(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || !active) return;
    const now = new Date();
    const time = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              unread: false,
              messages: [...t.messages, { id: `local-${Date.now()}`, from: "me", text: input.trim(), time }],
            }
          : t
      )
    );
    setInput("");
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-0 overflow-hidden rounded-card border border-line bg-surface shadow-card lg:h-[calc(100vh-10rem)] lg:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <aside
          className={cn(
            "flex-col border-line bg-surface lg:flex lg:border-r",
            activeId && "hidden lg:flex"
          )}
        >
          <div className="border-b border-line p-4">
            <h2 className="text-base font-extrabold text-slate-900">Pesan</h2>
            <p className="mt-0.5 text-xs text-slate-400">{threads.length} percakapan</p>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari percakapan..."
                className="h-9 w-full rounded-xl border border-line bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-500/10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {visible.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                  activeId === t.id ? "bg-cyan-50/70" : "hover:bg-slate-50"
                )}
              >
                <span className="relative shrink-0">
                  <Avatar initials={t.initials} color={t.color} />
                  {t.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-slate-900">{t.name}</span>
                    <span className="text-[11px] text-slate-400">{t.time}</span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-slate-500">
                      {t.messages[t.messages.length - 1]?.text}
                    </span>
                    {t.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-500" />}
                  </span>
                </span>
              </button>
            ))}
            {visible.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-slate-400">
                Tidak ada percakapan
              </p>
            )}
          </div>
        </aside>

        {/* Chat pane */}
        <section className={cn("flex-col lg:flex", !activeId && "hidden")}>
          {active ? (
            <>
              <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  aria-label="Kembali"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar initials={active.initials} color={active.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{active.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className={cn("h-2 w-2 rounded-full", active.online ? "bg-green-500" : "bg-slate-300")} />
                    {active.online ? "Online" : active.role}
                  </p>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                        m.from === "me"
                          ? "rounded-br-md bg-cyan-500 text-white"
                          : "rounded-bl-md border border-line bg-white text-slate-700"
                      )}
                    >
                      <p>{m.text}</p>
                      <p
                        className={cn(
                          "mt-1 text-right text-[10px]",
                          m.from === "me" ? "text-cyan-100" : "text-slate-400"
                        )}
                      >
                        {m.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={send} className="flex items-center gap-2 border-t border-line bg-white p-3">
                <button
                  type="button"
                  aria-label="Lampirkan file"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-slate-400 transition-colors hover:border-cyan-300 hover:text-cyan-600"
                >
                  <Paperclip className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-slate-50 px-3 text-sm outline-none focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-500/10"
                />
                <button
                  type="submit"
                  aria-label="Kirim pesan"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-white transition-colors hover:bg-cyan-600 disabled:opacity-40"
                  disabled={!input.trim()}
                >
                  <Send className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-slate-400">
              Pilih percakapan untuk mulai membaca pesan.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}