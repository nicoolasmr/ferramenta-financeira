
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentWithoutOrderDetector } from "@/lib/consistency/detectors/payment_without_order";
import { PayoutUnmatchedDetector } from "@/lib/consistency/detectors/payout_unmatched";

import { requireInternalAuth } from "@/lib/security/internalAuth";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // Auth Check (Cron Secret)
    const authError = requireInternalAuth(req);
    if (authError) return authError;

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
