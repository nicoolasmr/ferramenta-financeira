import { createClient } from "@/lib/supabase/server";

export async function getReceivablesMetrics(orgId: string, projectId?: string) {
    const supabase = await createClient();

    // Base query
    let query = supabase.from("installments").select("amount_cents, due_date, status, plan_id, payment_plans!inner(enrollment_id, enrollments!inner(project_id))")
        .eq("org_id", orgId);

    // Note: In a real app we would use exact JOINs or View, for MVP we trust RLS and filter in memory or straightforward join
    // Using Supabase deep filtering:
    if (projectId) {
        query = query.eq("payment_plans.enrollments.project_id", projectId);
    }

    const { data: installments, error } = await query;
    if (error || !installments) {
        return { overdue: 0, next7: 0, next30: 0, next60: 0 };
    }

    const today = new Date();
    const next7 = new Date(); next7.setDate(today.getDate() + 7);
    const next30 = new Date(); next30.setDate(today.getDate() + 30);
    const next60 = new Date(); next60.setDate(today.getDate() + 60);

    let metrics = {
        overdue: 0,
        next7: 0,
        next30: 0,
        next60: 0,
        agingBuckets: {
            "1-30": 0,
            "31-60": 0,
            "60+": 0
        }
    };

    installments.forEach((inst: any) => {
        const dueDate = new Date(inst.due_date);
        const amount = inst.amount_cents;

        if (inst.status === 'overdue' || (inst.status === 'pending' && dueDate < today)) {
            metrics.overdue += amount;

            // Aging
            const diffTime = Math.abs(today.getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 30) metrics.agingBuckets["1-30"] += amount;
            else if (diffDays <= 60) metrics.agingBuckets["31-60"] += amount;
            else metrics.agingBuckets["60+"] += amount;

        } else if (inst.status === 'pending') {
            if (dueDate <= next7) metrics.next7 += amount;
            if (dueDate <= next30) metrics.next30 += amount;
            if (dueDate <= next60) metrics.next60 += amount;
        }
    });

    return metrics;
}
