
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentWithoutOrderDetector } from "@/lib/consistency/detectors/payment_without_order";
import { PayoutUnmatchedDetector } from "@/lib/consistency/detectors/payout_unmatched";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // Auth Check (Cron Secret) - Optional for MVP local but critical for prod
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    const results = {
        checked: 0,
        errors: [] as string[]
    };

    const detectors = [
        PaymentWithoutOrderDetector,
        PayoutUnmatchedDetector
        // Add others
    ];

    for (const detector of detectors) {
        try {
            await detector.run(supabase);
            results.checked++;
        } catch (err: any) {
            results.errors.push(`${detector.name}: ${err.message}`);
        }
    }

    return NextResponse.json({ success: true, results });
}
