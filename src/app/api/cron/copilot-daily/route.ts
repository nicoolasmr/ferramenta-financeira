
import { NextRequest, NextResponse } from "next/server";
import { runCopilotForOrg } from "@/lib/copilot/scheduler";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

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
