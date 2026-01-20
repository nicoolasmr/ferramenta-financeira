"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/*
 renegociateInstallments Action
 - Marks old installments as 'renegotiated'
 - Creates new installments from provided list
 - Logs audit
*/
export async function renegotiateInstallments(
    orgId: string,
    enrollmentId: string,
    projectId: string,
    oldInstallmentIds: string[],
    newInstallmentsData: any[] // Should be typed strictly in real app
) {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) throw new Error("Unauthorized");

    // 1. Mark old as renegotiated
    const { error: updateError } = await supabase
        .from("installments")
        .update({ status: "renegotiated" })
        .in("id", oldInstallmentIds)
        .eq("org_id", orgId);

    if (updateError) throw new Error("Failed to update old installments");

    // 2. Insert new installments
    const { error: insertError } = await supabase
        .from("installments")
        .insert(newInstallmentsData.map(inst => ({
            ...inst,
            org_id: orgId,
            status: "pending"
        })));

    if (insertError) throw new Error("Failed to create new installments");

    // 3. Audit Log
    await supabase.from("audit_logs").insert({
        org_id: orgId,
        entity: "enrollment",
        entity_id: enrollmentId,
        action: "renegotiate_installments",
        details: JSON.stringify({ old_ids: oldInstallmentIds, new_count: newInstallmentsData.length }),
        actor_id: user.id
    });

    revalidatePath(`/app/enrollments/${enrollmentId}`);
    revalidatePath(`/app/projects/${projectId}/dashboard`);
}

export async function markInstallmentPaid(
    orgId: string,
    installmentId: string,
    enrollmentId: string,
    paidAt: Date,
    method: string,
    receiptPath?: string
) {
    const supabase = createClient();
    const user = (await supabase.auth.getUser()).data.user;

    const { error } = await supabase
        .from("installments")
        .update({
            status: "paid",
            paid_at: paidAt.toISOString(),
            method: method,
            receipt_file_path: receiptPath
        })
        .eq("id", installmentId)
        .eq("org_id", orgId);

    if (error) throw error;

    await supabase.from("audit_logs").insert({
        org_id: orgId,
        entity: "installment",
        entity_id: installmentId,
        action: "mark_paid",
        details: JSON.stringify({ paid_at: paidAt, method }),
        actor_id: user?.id
    });

    revalidatePath(`/app/enrollments/${enrollmentId}`);
}
