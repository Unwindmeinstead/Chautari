import * as React from "react";
import Link from "next/link";
import { MessageSquare, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "warning" | "success" | "secondary" | "destructive" }> = {
  submitted:     { label: "New", variant: "warning" },
  under_review:  { label: "Reviewing", variant: "info" as any },
  accepted:      { label: "Accepted", variant: "success" },
  completed:     { label: "Completed", variant: "secondary" },
  denied:        { label: "Denied", variant: "destructive" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
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
  const badge = STATUS_BADGE[requestStatus] ?? { label: requestStatus, variant: "secondary" as const };
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-start gap-3.5 px-4 py-3.5 transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-0",
        hasUnread && "bg-forest-50/50 hover:bg-forest-50"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-sm font-semibold mt-0.5",
        hasUnread ? "bg-forest-600 text-white" : "bg-gray-100 text-gray-500"
      )}>
        {patientName?.[0]?.toUpperCase() ?? <MessageSquare className="size-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-sm truncate", hasUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
            {patientName ?? "Unknown Patient"}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {lastMessageAt && (
              <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                <Clock className="size-2.5" />
                {timeAgo(lastMessageAt)}
              </span>
            )}
            {hasUnread && (
              <span className="h-5 min-w-5 rounded-full bg-forest-600 text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0 shrink-0">
            {badge.label}
          </Badge>
          {lastMessagePreview ? (
            <p className={cn("text-xs truncate", hasUnread ? "text-gray-700" : "text-gray-400")}>
              {lastMessagePreview}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">No messages yet</p>
          )}
        </div>
      </div>
    </Link>
  );
}
