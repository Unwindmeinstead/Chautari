import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Building2, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversation } from "@/lib/messaging-actions";
import { MessageThread } from "@/components/messaging/message-thread";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { careTypeLabel } from "@/lib/utils";

export const metadata = { title: "Messages | Chautari" };
export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { label: string; variant: "warning" | "success" | "secondary" | "destructive" | "default" | "info" }> = {
  submitted:    { label: "New request", variant: "warning" },
  under_review: { label: "Under review", variant: "info" },
  accepted:     { label: "Accepted ✓", variant: "success" },
  completed:    { label: "Completed", variant: "secondary" },
  denied:       { label: "Denied", variant: "destructive" },
};

export default async function PatientMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: requestId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { conversation, error } = await getOrCreateConversation(requestId);
  if (error || !conversation) return notFound();

  // Verify this patient owns this request
  if (conversation.patient_id !== user.id) redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const patientName = profile?.full_name ?? user.email?.split("@")[0] ?? "You";
  const statusConf = STATUS_CONFIG[conversation.request_status] ?? { label: conversation.request_status, variant: "secondary" as const };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="-ml-1">
            <Link href={`/switch/${requestId}`}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          {/* Agency info */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-forest-100 flex items-center justify-center shrink-0">
              <Building2 className="size-4 text-forest-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                {conversation.agency_name}
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

          <div className="flex items-center gap-1 text-xs text-green-600 shrink-0">
            <ShieldCheck className="size-3.5" />
            <span className="hidden sm:inline">Secure</span>
          </div>
        </div>
      </header>

      {/* Thread */}
      <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col" style={{ height: "calc(100vh - 61px)" }}>
        <MessageThread
          conversation={conversation}
          currentUserId={user.id}
          currentUserName={patientName}
          currentRole="patient"
        />
      </div>
    </div>
  );
}
