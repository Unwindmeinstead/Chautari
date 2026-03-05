import * as React from "react";
import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationRowProps {
  id: string;
  requestId: string;
  patientName: string | null;
  requestStatus: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  href: string;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  submitted: { label: "New", bg: "bg-amber-50", text: "text-amber-700" },
  under_review: { label: "Reviewing", bg: "bg-blue-50", text: "text-blue-700" },
  accepted: { label: "Accepted", bg: "bg-emerald-50", text: "text-emerald-700" },
  completed: { label: "Completed", bg: "bg-zinc-100", text: "text-zinc-700" },
  denied: { label: "Denied", bg: "bg-red-50", text: "text-red-700" },
  cancelled: { label: "Cancelled", bg: "bg-zinc-50", text: "text-zinc-500" },
};

function timeAgo(dateStrToLocalUrlString: string | null) {
  if (!dateStrToLocalUrlString) return "";
  const diff = Date.now() - new Date(dateStrToLocalUrlString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function ConversationRow({
  patientName,
  requestStatus,
  lastMessagePreview,
  lastMessageAt,
  unreadCount,
  href,
}: ConversationRowProps) {
  const badge = STATUS_BADGE[requestStatus] ?? { label: requestStatus, bg: "bg-zinc-100", text: "text-zinc-600" };
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-zinc-50/80 group",
        hasUnread ? "bg-blue-50/30 hover:bg-blue-50/50" : ""
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "h-11 w-11 rounded-2xl shrink-0 flex items-center justify-center text-[15px] font-bold mt-0.5 transition-colors",
        hasUnread ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200"
      )}>
        {patientName?.[0]?.toUpperCase() ?? <MessageSquare className="size-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center pt-0.5">
        <div className="flex items-center justify-between gap-3">
          <span className={cn("text-[14px] truncate", hasUnread ? "font-bold text-zinc-900" : "font-semibold text-zinc-800")}>
            {patientName ?? "Unknown Patient"}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {lastMessageAt && (
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 uppercase tracking-widest">
                <Clock className="size-3 opacity-70" />
                {timeAgo(lastMessageAt)}
              </span>
            )}
            {hasUnread && (
              <span className="h-5 px-1.5 rounded-md bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-1">
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-widest border border-white/50", badge.bg, badge.text)}>
            {badge.label}
          </span>
          {lastMessagePreview ? (
            <p className={cn("text-[13px] truncate font-medium", hasUnread ? "text-zinc-700 font-semibold" : "text-zinc-500")}>
              {lastMessagePreview}
            </p>
          ) : (
            <p className="text-[13px] text-zinc-400 italic font-medium">No messages yet</p>
          )}
        </div>
      </div>
    </Link>
  );
}
