import { redirect } from "next/navigation";
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
    <div className="min-h-screen bg-[#FAFAFB] text-zinc-900 font-sans pb-20">
      <AgencyNav
        agencyName={agency.name}
        staffName={staffName}
        staffRole={member.role}
        pendingCount={stats.pending}
        unreadMessages={totalUnread}
      />

      <main className="max-w-[800px] mx-auto px-5 py-10 space-y-6">
        <div className="space-y-1 my-4">
          <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            Messages
            {totalUnread > 0 && (
              <span className="h-6 px-2 rounded-full bg-blue-600 text-white text-[12px] font-bold flex items-center justify-center shadow-sm">
                {totalUnread} new
              </span>
            )}
          </h1>
          <p className="text-[14px] font-medium text-zinc-500">Secure conversations with your patients.</p>
        </div>

        <div className="rounded-2xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden">
          {conversations.length === 0 ? (
            <div className="py-16 text-center space-y-3 p-6">
              <div className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto shadow-sm">
                <Inbox className="size-6 text-zinc-400" />
              </div>
              <p className="text-[15px] font-bold text-zinc-800">No conversations yet</p>
              <p className="text-[13px] font-medium text-zinc-500 max-w-[260px] mx-auto">
                When patients submit switch requests, a secure conversation thread opens here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50/50 border-b border-zinc-100">
                <MessageSquare className="size-3.5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
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

        <p className="text-[11px] font-semibold text-center text-zinc-400 flex items-center justify-center gap-1.5 pt-4">
          <span className="text-emerald-500">🔒</span>
          All conversations are private and HIPAA-compliant
        </p>
      </main>
    </div>
  );
}
