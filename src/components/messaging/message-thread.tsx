"use client";

import * as React from "react";
import { Send, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markMessagesRead } from "@/lib/messaging-actions";
import { MessageBubble } from "./message-bubble";
import { Button } from "@/components/ui/button";
import type { Message, ConversationWithContext } from "@/lib/messaging-actions";

interface MessageThreadProps {
  conversation: ConversationWithContext;
  currentUserId: string;
  currentUserName: string;
  currentRole: "patient" | "agency_staff";
}

const BLOCKED_STATUSES = ["denied", "cancelled"];

export function MessageThread({
  conversation,
  currentUserId,
  currentUserName,
  currentRole,
}: MessageThreadProps) {
  const [messages, setMessages] = React.useState<Message[]>(conversation.messages);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const isBlocked = BLOCKED_STATUSES.includes(conversation.request_status);
  const charCount = input.length;
  const overLimit = charCount > 4000;

  // Scroll to bottom on new message
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read on mount and when messages change
  React.useEffect(() => {
    markMessagesRead(conversation.id);
  }, [conversation.id]);

  // Supabase Realtime subscription
  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Avoid duplicates (optimistic insert already added it)
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark read if from the other party
          if (newMsg.sender_id !== currentUserId) {
            markMessagesRead(conversation.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId]);

  // Auto-resize textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  async function handleSend() {
    const body = input.trim();
    if (!body || sending || overLimit || isBlocked) return;

    setSending(true);
    setError(null);

    // Optimistic insert
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      sender_role: currentRole,
      body,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const result = await sendMessage(conversation.id, body);

    setSending(false);

    if (result.error) {
      // Roll back optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setInput(body);
      setError(result.error);
    } else if (result.message) {
      // Replace temp with real
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsg.id ? result.message! : m))
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date for date dividers
  const grouped = React.useMemo(() => {
    const out: { date: string; messages: Message[] }[] = [];
    let lastDate = "";
    for (const msg of messages) {
      const d = new Date(msg.created_at).toDateString();
      if (d !== lastDate) {
        out.push({ date: d, messages: [msg] });
        lastDate = d;
      } else {
        out[out.length - 1].messages.push(msg);
      }
    }
    return out;
  }, [messages]);

  function dateDividerLabel(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(d);
  }

  const otherPartyName =
    currentRole === "patient"
      ? conversation.agency_name
      : conversation.patient_name ?? "Patient";

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 gap-3">
            <div className="h-14 w-14 rounded-full bg-forest-50 flex items-center justify-center">
              <Lock className="size-6 text-forest-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Secure conversation</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                Messages between you and {otherPartyName} are encrypted and private.
              </p>
            </div>
            <p className="text-xs text-gray-400 italic">Start the conversation below.</p>
          </div>
        ) : (
          <>
            {grouped.map(({ date, messages: dayMsgs }) => (
              <div key={date} className="space-y-3">
                {/* Date divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[11px] text-gray-400 font-medium shrink-0">
                    {dateDividerLabel(date)}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Messages */}
                {dayMsgs.map((msg, i) => {
                  const isMine = msg.sender_id === currentUserId;
                  const prevMsg = dayMsgs[i - 1];
                  const showSender =
                    !isMine &&
                    (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isMine={isMine}
                      senderName={isMine ? currentUserName : otherPartyName}
                      showSender={showSender}
                    />
                  );
                })}
              </div>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        {isBlocked ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 justify-center py-2">
            <Lock className="size-4" />
            Messaging is closed for this request
          </div>
        ) : (
          <>
            {error && (
              <p className="text-xs text-red-500 mb-2">{error}</p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${otherPartyName}…`}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all max-h-40 leading-relaxed"
                disabled={sending}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sending || overLimit}
                size="sm"
                className="h-10 w-10 p-0 shrink-0 rounded-xl"
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            {charCount > 3500 && (
              <p className={`text-xs mt-1 text-right ${overLimit ? "text-red-500" : "text-gray-400"}`}>
                {charCount}/4000
              </p>
            )}
            <p className="text-[10px] text-gray-400 mt-1.5">
              Press Enter to send · Shift+Enter for new line
            </p>
          </>
        )}
      </div>
    </div>
  );
}
