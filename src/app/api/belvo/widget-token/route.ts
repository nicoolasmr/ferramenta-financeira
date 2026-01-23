import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createWidgetAccessToken } from "@/lib/belvo/client";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { org_id, project_id } = body;

        if (!org_id) {
            return NextResponse.json({ error: "org_id is required" }, { status: 400 });
        }

        // 1. Validate membership
        const { data: membership, error: membershipError } = await supabase
            .from("memberships")
            .select("role")
            .eq("org_id", org_id)
            .eq("user_id", user.id)
            .single();

        if (membershipError || !membership) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Generate token
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const callbackUrls = {
            success: `${baseUrl}/api/belvo/callbacks/success`,
            exit: `${baseUrl}/api/belvo/callbacks/exit`,
            event: `${baseUrl}/api/belvo/callbacks/event`
        };

        const tokenData = await createWidgetAccessToken(callbackUrls, user.id);

        return NextResponse.json(tokenData);
    } catch (error: any) {
        console.error("Widget Token API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
