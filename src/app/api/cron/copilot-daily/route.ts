
import { NextRequest, NextResponse } from "next/server";
import { runCopilotForOrg } from "@/lib/copilot/scheduler";
import { createClient } from "@/lib/supabase/server";

import { requireInternalAuth } from "@/lib/security/internalAuth";

export async function POST(req: NextRequest) {
    const authError = requireInternalAuth(req);
    if (authError) return authError;

    const supabase = await createClient();
    // Get all Active Organizations
    const { data: orgs } = await supabase.from("organizations").select("id");

    if (!orgs) return NextResponse.json({ processed: 0 });

    let count = 0;
    for (const org of orgs) {
        await runCopilotForOrg(org.id);
        count++;
    }

    return NextResponse.json({ processed: count });
}
