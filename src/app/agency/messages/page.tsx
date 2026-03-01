import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAgencyPortalData } from "@/lib/agency-portal-actions";
import { getAgencyConversations } from "@/lib/messaging-actions";
import { AgencyNav } from "@/components/agency/agency-nav";
import { ConversationRow } from "@/components/messaging/conversation-row";

export const metadata = { title: "Messages | Agency Portal" };
export const dynamic = "force-dynamic";

export default async function AgencyMessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [portalData, convData] = await Promise.all([
    getAgencyPortalData(),
    getAgencyConversations(),
  ]);

  if (!portalData.agency || !portalData.member) redirect("/agency/dashboard");

  const { agency, member, stats } = portalData;
  const staffName = user.email?.split("@")[0] ?? "Staff";
  const { conversations } = convData;

  const totalUnread = conversations.reduce((sum, c) => sum + c.agency_unread, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
      />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="font-fraunces text-3xl font-semibold text-gray-800 flex items-center gap-3">
              Messages
              {totalUnread > 0 && (
                <span className="h-7 min-w-7 rounded-full bg-forest-600 text-white text-sm font-bold flex items-center justify-center px-2">
                  {totalUnread}
                </span>
              )}
            </h1>
            <p className="text-gray-500">
              Secure conversations with patients
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-card overflow-hidden">
          {conversations.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <Inbox className="size-7 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No conversations yet</p>
              <p className="text-xs text-gray-400 max-w-[220px] mx-auto">
                When patients submit switch requests, a secure conversation thread opens here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Header row */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <MessageSquare className="size-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                </span>
              </div>

              {conversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  id={conv.id}
                  requestId={conv.request_id}
                  patientName={conv.patient_name}
                  requestStatus={conv.request_status}
                  lastMessagePreview={conv.last_message_preview}
                  lastMessageAt={conv.last_message_at}
                  unreadCount={conv.agency_unread}
                  href={`/agency/messages/${conv.id}`}
                />
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
          <span className="text-green-500">🔒</span>
          All conversations are private and HIPAA-compliant
        </p>
      </main>
    </div>
  );
}
