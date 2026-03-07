import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversation } from "@/lib/messaging-actions";
import { MessageThread } from "@/components/messaging/message-thread";

export const metadata = { title: "Admin Messaging | SwitchMyCare" };
export const dynamic = "force-dynamic";

interface PageProps {
    params: { id: string };
}

export default async function AdminConversationPage({ params }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "switchmycare_admin") {
        redirect("/dashboard");
    }

    // Admin uses the same getOrCreateConversation logic but they can view any requestId
    // Actually, the [id] here is the conversation_id from the list
    const { data: conv } = await supabase
        .from("conversations")
        .select("request_id")
        .eq("id", params.id)
        .single();

    if (!conv) notFound();

    const { conversation, error } = await getOrCreateConversation(conv.request_id);

    if (error || !conversation) {
        return (
            <div className="min-h-screen bg-[#0F2419] flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <p className="text-cream-300">Error loading conversation: {error}</p>
                    <Link href="/admin" className="text-amber-500 hover:underline">Return to Admin Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0F2419] text-white">
            {/* Admin Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <ArrowLeft className="size-4 text-cream-200" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-cream-100 flex items-center gap-1.5">
                                <Shield className="size-3.5 text-red-400" />
                                Admin Oversight: {conversation.patient_name || "Patient"} & {conversation.agency_name}
                            </h1>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-400/20 text-red-400 uppercase tracking-wider">
                                Platform Admin
                            </span>
                        </div>
                        <p className="text-[11px] text-white/40 mt-0.5">
                            Case Reference: {conversation.request_id.slice(0, 8)}... · Status: {conversation.request_status}
                        </p>
                    </div>
                </div>
            </header>

            {/* Messaging Area */}
            <main className="flex-1 overflow-hidden">
                <MessageThread
                    conversation={conversation}
                    currentUserId={user.id}
                    currentUserName={profile.full_name || "System Admin"}
                    currentRole="admin"
                />
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        :root {
          --cream-100: #FFF8E7;
          --cream-200: rgba(255, 248, 231, 0.8);
          --cream-300: rgba(255, 248, 231, 0.6);
        }
      `}} />
        </div>
    );
}
