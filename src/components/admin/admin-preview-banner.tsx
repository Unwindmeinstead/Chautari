"use client";

import * as React from "react";
import { Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminPreviewBannerProps {
    viewingAs: string; // "patient" | "agency"
}

export function AdminPreviewBanner({ viewingAs }: AdminPreviewBannerProps) {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    async function returnToAdmin() {
        setLoading(true);
        const res = await fetch("/api/admin/view-as", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "admin" }),
        });
        const { redirectTo } = await res.json();
        router.push(redirectTo);
    }

    return (
        <div className="sticky top-0 z-[9999] flex items-center justify-between px-4 py-2 text-[12px] font-semibold"
            style={{ background: "#7C3AED", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="flex items-center gap-2 text-white/90">
                <Eye className="size-3.5" />
                Previewing as <span className="capitalize text-white">{viewingAs}</span> dashboard
            </div>
            <button
                onClick={returnToAdmin}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all disabled:opacity-50"
            >
                <X className="size-3" />
                {loading ? "Returning…" : "Back to Admin"}
            </button>
        </div>
    );
}
