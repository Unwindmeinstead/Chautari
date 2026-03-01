import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard-actions";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Notifications | Chautari" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const data = await getDashboardData();

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNav
        userName={data.profile?.full_name ?? null}
        unreadCount={data.unreadCount}
      />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="space-y-1">
          <h1 className="font-fraunces text-3xl font-semibold text-forest-800">
            Notifications
          </h1>
          <p className="text-forest-500">
            {data.unreadCount > 0
              ? `You have ${data.unreadCount} unread notification${data.unreadCount > 1 ? "s" : ""}.`
              : "You're all caught up."}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-forest-100 shadow-card overflow-hidden">
          <NotificationsList
            notifications={data.notifications}
            showMarkAll={data.unreadCount > 0}
          />
        </div>
      </main>
    </div>
  );
}
