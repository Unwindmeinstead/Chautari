import * as React from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/messaging-actions";

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  senderName?: string;
  showSender?: boolean;
}

export function MessageBubble({
  message,
  isMine,
  senderName,
  showSender,
}: MessageBubbleProps) {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(message.created_at));

  const date = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(message.created_at));

  return (
    <div className={cn("flex gap-2 group", isMine ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar dot */}
      <div
        className={cn(
          "mt-1 h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold",
          isMine
            ? "bg-forest-600 text-white"
            : "bg-amber-100 text-amber-700"
        )}
      >
        {senderName?.[0]?.toUpperCase() ?? (isMine ? "Y" : "?")}
      </div>

      <div className={cn("flex flex-col gap-0.5 max-w-[75%]", isMine ? "items-end" : "items-start")}>
        {showSender && senderName && (
          <span className="text-xs text-gray-400 px-1">{senderName}</span>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isMine
              ? "bg-forest-600 text-white rounded-tr-sm"
              : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
          )}
        >
          {message.body}
        </div>

        <div className="flex items-center gap-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-gray-400">{time} · {date}</span>
          {isMine && (
            <span className="text-[10px] text-gray-400">
              {message.is_read ? "Read" : "Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
