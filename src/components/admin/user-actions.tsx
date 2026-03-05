"use client";

import { Trash2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface DeleteUserButtonProps {
    userId: string;
    userName: string | null;
    deleteAction: (userId: string) => Promise<{ error?: string }>;
}

export function DeleteUserButton({ userId, userName, deleteAction }: DeleteUserButtonProps) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <button
            type="button"
            title="Delete account permanently"
            disabled={pending}
            onClick={() => {
                if (!confirm(`Permanently delete ${userName ?? userId}? This cannot be undone.`)) return;
                startTransition(async () => {
                    await deleteAction(userId);
                    router.refresh();
                });
            }}
            className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
            style={{
                background: "rgba(252,165,165,0.05)",
                border: "1px solid rgba(252,165,165,0.1)",
            }}
        >
            <Trash2 className="size-3.5 text-red-400/50 hover:text-red-400 transition-colors" />
        </button>
    );
}

interface RoleSelectProps {
    userId: string;
    currentRole: string;
    roleOptions: { v: string; l: string }[];
    setRoleAction: (userId: string, role: string) => Promise<{ error?: string }>;
}

export function RoleSelect({ userId, currentRole, roleOptions, setRoleAction }: RoleSelectProps) {
    const [pending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <div className="inline-flex items-center gap-1.5">
            <select
                defaultValue={currentRole}
                disabled={pending}
                onChange={(e) => {
                    const newRole = e.currentTarget.value;
                    startTransition(async () => {
                        await setRoleAction(userId, newRole);
                        router.refresh();
                    });
                }}
                className="text-[11px] px-2 py-1.5 rounded-xl font-medium appearance-none cursor-pointer transition-opacity"
                style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    outline: "none",
                    opacity: pending ? 0.5 : 1,
                }}
            >
                {roleOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            {pending && (
                <RefreshCw className="size-3.5 text-white/30 animate-spin" />
            )}
        </div>
    );
}
