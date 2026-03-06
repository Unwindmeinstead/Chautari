import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VIEW_AS_COOKIE } from "@/lib/supabase/middleware";

const ROLE_DESTINATIONS: Record<string, string> = {
    patient: "/dashboard",
    agency: "/agency/dashboard",
    admin: "/admin",
};

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // TEMP BYPASS FOR DEMO
    const isBypass = false;
    if (!isBypass) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (profile?.role !== "switchmycare_admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    const { role } = await request.json();
    if (!ROLE_DESTINATIONS[role]) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const destination = ROLE_DESTINATIONS[role];
    const response = NextResponse.json({ redirectTo: destination });

    if (role === "admin") {
        response.cookies.delete(VIEW_AS_COOKIE);
    } else {
        response.cookies.set(VIEW_AS_COOKIE, role, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            // No maxAge — session cookie, clears on browser close
        });
    }

    return response;
}
