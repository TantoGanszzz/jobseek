"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sendMessageAction } from "@/app/actions/hrd";
import { Hash, Send, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage, Conversation } from "@/lib/hrd/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatApp({
  conversations,
  active,
  messages,
  currentUserId,
}: {
  conversations: Conversation[];
  active: Conversation | null;
  messages: ChatMessage[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    const clean = text.trim();
    if (!clean) return;
    setSending(true);
    setError(null);
    const result = await sendMessageAction(active.id, clean);
    setSending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setText("");
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-slate-900">
          <Users className="h-4 w-4 text-blue-600" />
          Conversations
        </div>
        <div className="space-y-1">
          {conversations.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-400">
              No conversations yet.
            </p>
          )}
          {conversations.map((conv) => {
            const isActive = active?.id === conv.id;
            return (
              <Link
                key={conv.id}
                href={`/company/messages?conv=${conv.id}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                  isActive ? "bg-blue-50" : "hover:bg-slate-50"
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  {conv.channel ? <Hash className="h-4 w-4" /> : <Avatar className="h-8 w-8"><AvatarFallback>{initials(conv.name)}</AvatarFallback></Avatar>}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-900">{conv.name}</span>
                  <span className="block truncate text-xs text-slate-400">
                    {conv.channel ? "Channel" : "Direct message"}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </aside>

      <section className="flex min-h-[480px] flex-col rounded-xl border border-slate-200 bg-white">
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">Select a conversation</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Pick a conversation from the list to start chatting with your team.
            </p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                {active.channel ? <Hash className="h-4 w-4" /> : initials(active.name)}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{active.name}</h2>
                <p className="text-xs text-slate-400">{active.channel ? "Company channel" : "Direct message"}</p>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
              {messages.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No messages yet. Say hello!</p>
              )}
              {messages.map((m) => {
                const mine = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                        mine
                          ? "rounded-br-sm bg-blue-600 text-white"
                          : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                      )}
                    >
                      {!mine && (
                        <div className="mb-0.5 text-xs font-medium text-blue-700">{m.senderName}</div>
                      )}
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    </div>
                    <span className="mt-1 text-[11px] text-slate-400">{formatTime(m.createdAt)}</span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-200 p-3">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="h-10 border-slate-200"
              />
              <Button type="submit" disabled={sending || !text.trim()} className="h-10 cursor-pointer bg-blue-600 px-4 text-white hover:bg-blue-700">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {error && <p className="px-3 pb-2 text-xs text-red-600">{error}</p>}
          </>
        )}
      </section>
    </div>
  );
}