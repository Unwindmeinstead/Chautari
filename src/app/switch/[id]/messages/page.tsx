import React from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Building2, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversation } from "@/lib/messaging-actions";
import { MessageThread } from "@/components/messaging/message-thread";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { careTypeLabel } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export const metadata = { title: "Messages | SwitchMyCare" };
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
  
  // MOCK DATA FOR UI PREVIEW
  if (!user || !user.id) {
    const mockConversation = {
      id: "conv-1",
      request_id: requestId,
      agency_id: "a1",
      patient_id: "mock-patient",
      request_status: "under_review",
      last_message_at: new Date().toISOString(),
      agency: { id: "a1", name: "Premium Care Agency" },
    };
    
    const mockMessages = [
      { id: "m1", content: "Hello! Thank you for your switch request. We're currently reviewing your information.", sender: "agency", created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: "m2", content: "Thank you for the quick response! I'm looking forward to working with your agency.", sender: "patient", created_at: new Date(Date.now() - 1800000).toISOString() },
      { id: "m3", content: "We will be in touch within 2-3 business days with an update.", sender: "agency", created_at: new Date().toISOString() },
    ];

    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <nav className="bg-white border-b border-[rgba(26,61,43,0.06)] px-6 py-4 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Logo size="md" />
            <Link href={`/switch/${requestId}`} className="flex items-center gap-2 text-sm text-forest-600 hover:text-forest-800 transition-colors">
              ← Back to Request
            </Link>
          </div>
        </nav>

        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          <div className="bg-white rounded-3xl border border-[rgba(26,61,43,0.06)] overflow-hidden">
            <div className="p-6 border-b border-[rgba(26,61,43,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-fraunces text-xl font-semibold text-forest-800">Premium Care Agency</h1>
                  <p className="text-sm text-[#6B7B6E]">Personal Care Services</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Under Review</div>
              </div>
            </div>
            
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl ${msg.sender === "patient" ? "bg-forest-600 text-cream" : "bg-[rgba(26,61,43,0.06)] text-forest-700"}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-2 ${msg.sender === "patient" ? "text-cream/60" : "text-[#6B7B6E]"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-[rgba(26,61,43,0.06)]">
              <div className="flex gap-3">
                <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-3 rounded-full border border-[rgba(26,61,43,0.1)] text-sm focus:outline-none focus:border-forest-400" />
                <button className="px-6 py-3 rounded-full bg-forest-600 text-cream font-medium text-sm hover:bg-forest-700 transition-colors">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
