"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell, CheckCircle2, AlertCircle, Building2,
  FileText, Info, BellOff, CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/dashboard-actions";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/lib/dashboard-actions";

type Notification = DashboardData["notifications"][number];

const TYPE_CONFIG: Record<string, {
  icon: React.ReactNode;
  color: string;
  bg: string;
}> = {
  request_submitted: {
    icon: <FileText className="size-4" />,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  request_accepted: {
    icon: <CheckCircle2 className="size-4" />,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  request_denied: {
    icon: <AlertCircle className="size-4" />,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  request_completed: {
    icon: <CheckCircle2 className="size-4" />,
    color: "text-forest-600",
    bg: "bg-forest-100",
  },
  agency_message: {
    icon: <Building2 className="size-4" />,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  system: {
    icon: <Info className="size-4" />,
    color: "text-gray-500",
    bg: "bg-gray-100",
  },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;
  const isUnread = !notification.read_at;
  const href = notification.reference_type === "switch_request"
    ? `/switch/${notification.reference_id}`
    : "/dashboard";

  async function handleClick() {
    if (isUnread) {
      onRead?.(notification.id);
      await markNotificationRead(notification.id);
    }
  }

  return (
    <Link href={href} onClick={handleClick}>
      <div className={cn(
        "flex items-start gap-3 px-4 py-4 hover:bg-forest-50 transition-colors cursor-pointer border-b border-forest-100 last:border-0",
        isUnread && "bg-forest-50/60"
      )}>
        {/* Icon */}
        <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
          <span className={cfg.color}>{cfg.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className={cn(
            "text-sm leading-snug",
            isUnread ? "font-semibold text-forest-800" : "font-medium text-forest-700"
          )}>
            {notification.title}
          </p>
          <p className="text-xs text-forest-500 leading-relaxed line-clamp-2">
            {notification.body}
          </p>
          <p className="text-xs text-forest-400">{timeAgo(notification.created_at)}</p>
        </div>

        {/* Unread dot */}
        {isUnread && (
          <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-2" />
        )}
      </div>
    </Link>
  );
}

interface NotificationsListProps {
  notifications: Notification[];
  maxItems?: number;
  showMarkAll?: boolean;
}

export function NotificationsList({
  notifications,
  maxItems,
  showMarkAll = false,
}: NotificationsListProps) {
  const [items, setItems] = React.useState(notifications);
  const [markingAll, setMarkingAll] = React.useState(false);

  const displayed = maxItems ? items.slice(0, maxItems) : items;
  const hasUnread = items.some((n) => !n.read_at);

  function handleRead(id: string) {
    setItems((prev) =>
      prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setMarkingAll(false);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="h-14 w-14 rounded-full bg-forest-100 flex items-center justify-center mx-auto">
          <BellOff className="size-7 text-forest-400" />
        </div>
        <p className="text-forest-500 text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div>
      {showMarkAll && hasUnread && (
        <div className="px-4 py-3 border-b border-forest-100 flex items-center justify-between">
          <p className="text-xs text-forest-400">
            {items.filter((n) => !n.read_at).length} unread
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll}
            className="gap-1.5 text-xs"
          >
            <CheckCheck className="size-3.5" />
            Mark all as read
          </Button>
        </div>
      )}
      <div>
        {displayed.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={handleRead} />
        ))}
      </div>
    </div>
  );
}
