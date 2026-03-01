import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { getOrCreateConversation } from "@/lib/messaging-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { MessageThread } from "@/components/messaging/message-thread";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { careTypeLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { label: string; variant: string }> = {
  submitted:    { label: "New", variant: "warning" },
  under_review: { label: "Reviewing", variant: "info" },
  accepted:     { label: "Accepted", variant: "success" },
  completed:    { label: "Completed", variant: "secondary" },
  denied:       { label: "Denied", variant: "destructive" },
};

export default async function AgencyMessageThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [portalData, convResult] = await Promise.all([
    getAgencyPortalData(),
    // We need to find the request_id from conversation_id
    supabase.from("conversations").select("request_id").eq("id", conversationId).single(),
  ]);

  if (!portalData.agency || !portalData.member) redirect("/agency/dashboard");
  if (convResult.error || !convResult.data) return notFound();
  const convData = convResult.data as NonNullable<typeof convResult.data>;

  const { conversation, error } = await getOrCreateConversation(convData.request_id);
  if (error || !conversation) return notFound();

  // Verify this agency staff can access this conversation
  if (conversation.agency_id !== portalData.agency.id) redirect("/agency/messages");

  const { agency, member, stats } = portalData;
  const staffName = user.email?.split("@")[0] ?? "Staff";
  const statusConf = STATUS_CONFIG[conversation.request_status] ?? { label: conversation.request_status, variant: "secondary" };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
      />

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 sticky top-[56px] z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="-ml-1">
            <Link href="/agency/messages">
              <ArrowLeft className="size-4" />
              Inbox
            </Link>
          </Button>

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-sm font-semibold text-amber-700">
              {conversation.patient_name?.[0]?.toUpperCase() ?? <User className="size-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                {conversation.patient_name ?? "Patient"}
              </p>
              <div className="flex items-center gap-1.5">
                <Badge variant={statusConf.variant as any} className="text-[10px] px-1.5 py-0">
                  {statusConf.label}
                </Badge>
                <span className="text-[11px] text-gray-400">
                  {careTypeLabel(conversation.request_care_type)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href={`/agency/requests/${convResult.data.request_id}`}>
                View request
              </Link>
            </Button>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <ShieldCheck className="size-3.5" />
              <span className="hidden sm:inline">Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thread */}
      <div
        className="flex-1 max-w-3xl mx-auto w-full flex flex-col"
        style={{ height: "calc(100vh - 116px)" }}
      >
        <MessageThread
          conversation={conversation}
          currentUserId={user.id}
          currentUserName={staffName}
          currentRole="agency_staff"
        />
      </div>
    </div>
  );
}
