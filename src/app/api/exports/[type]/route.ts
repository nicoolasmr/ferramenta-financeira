import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {
    const supabase = await createClient();
    const { type } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // Identify Org
    const { data: membership } = await supabase.from("memberships")
        .select("org_id")
        .eq("user_id", user.id)
        .single();
    if (!membership) return new NextResponse("No Org Found", { status: 403 });

    let query;
    let filename = `${type}-${new Date().toISOString().split('T')[0]}.csv`;

    // Define permissible exports
    if (type === 'payments') {
        query = supabase.from('payments').select('*').eq('org_id', membership.org_id);
    } else if (type === 'customers') {
        query = supabase.from('customers').select('*').eq('org_id', membership.org_id);
    } else {
        return new NextResponse("Invalid export type", { status: 400 });
    }

    const { data, error } = await query.csv();

    if (error) return new NextResponse(error.message, { status: 500 });

    return new NextResponse(data, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}"`
        }
    });
}
