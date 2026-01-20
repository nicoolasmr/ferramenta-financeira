import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processExternalEvent } from "@/lib/integrations/process";

export async function POST(req: Request) {
    const supabase = await createClient();

    // Check Permissions (Admin/Ops only)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // In real world, check 'ops' role. For MVP, allowing authenticated users.

    const body = await req.json() as { orgId?: string; provider?: string; eventId?: string };
    const { orgId, provider, eventId } = body;

    if (!orgId || !provider || !eventId) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    try {
        const result = await processExternalEvent(orgId, provider, eventId);
        return NextResponse.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return new NextResponse(message, { status: 500 });
    }
}
