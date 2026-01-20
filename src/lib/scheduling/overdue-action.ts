"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function syncOverdueStatuses(projectId: string) {
    const supabase = await createClient();

    // 1. Fetch pending installments that ARE overdue (today > due + grace)
    // We need to fetch the plan's schedule_rule to get grace_days
    // This is complex to do purely in SQL UPDATE without a function.
    // MVP Approach: Fetch Candidate Installments -> Check -> Update.
    // Performance: Indices help. This is "idempotent mechanism" via Server Action.

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Initial candidate fetch: Pending status and due_date < today
    // We filter exact grace days in code or refined query.
    const { data: installments, error } = await supabase
        .from("installments")
        .select(`
      id,
      due_date,
      status,
      payment_plans!inner (
        schedule_rule
      )
    `)
        .eq("status", "pending")
        .lt("due_date", today.toISOString()) // optimization
        .limit(500); // batch size

    if (error || !installments) return { success: false, error };

    const idsToUpdate: string[] = [];

    for (const inst of installments) {
        const rule = (inst.payment_plans as any).schedule_rule || {};
        const graceDays = rule.grace_days || 0;

        const dueDate = new Date(inst.due_date);
        dueDate.setUTCHours(0, 0, 0, 0);

        // Add grace days
        const deadline = new Date(dueDate);
        deadline.setDate(dueDate.getDate() + graceDays);

        if (today > deadline) {
            idsToUpdate.push(inst.id);
        }
    }

    if (idsToUpdate.length > 0) {
        await supabase
            .from("installments")
            .update({ status: "overdue" })
            .in("id", idsToUpdate);

        // Audit? Maybe too noisy for automated system action. 
        // Can leave implicit or log 'system' action.
    }

    revalidatePath(`/app/projects/${projectId}/dashboard`);
    revalidatePath(`/app/projects/${projectId}/enrollments`);

    return { success: true, count: idsToUpdate.length };
}
