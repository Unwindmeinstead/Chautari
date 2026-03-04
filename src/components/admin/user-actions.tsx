"use client";

import { Trash2 } from "lucide-react";

interface DeleteUserButtonProps {
    userId: string;
    userName: string | null;
    deleteAction: (userId: string) => Promise<{ error?: string }>;
}

export function DeleteUserButton({ userId, userName, deleteAction }: DeleteUserButtonProps) {
    return (
        <form
            action={async () => {
                await deleteAction(userId);
            }}
        >
            <button
                type="submit"
                title="Delete account permanently"
                onClick={(e) => {
                    if (!confirm(`Permanently delete ${userName ?? userId}? This cannot be undone.`)) {
                        e.preventDefault();
                    }
                }}
                className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors"
                style={{
                    background: "rgba(252,165,165,0.05)",
                    border: "1px solid rgba(252,165,165,0.1)",
                }}
            >
                <Trash2 className="size-3.5 text-red-400/50 hover:text-red-400 transition-colors" />
            </button>
        </form>
    );
}
