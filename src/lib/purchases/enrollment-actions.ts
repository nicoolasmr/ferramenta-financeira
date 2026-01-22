"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notifications";

/*
 renegociateInstallments Action
 - Marks old installments as 'renegotiated'
 - Creates new installments from provided list
 - Logs audit
*/
// ... (Top of file stays same)

/*
 renegotiateInstallments Action
 - Marks old installments as 'renegotiated'
 - Creates new installments from provided list
 - Logs audit
*/
export async function renegotiateInstallments(
    orgId: string,
    enrollmentId: string,
    projectId: string,
    oldInstallmentIds: string[],
    newInstallmentsData: any[]
) {
    const supabase = await createClient(); // Fixed await
    console.info(`[Action:Renegotiate] Start - Enrollment: ${enrollmentId}, Project: ${projectId}`);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("Unauthorized");

    // 1. Idempotency & Validation
    const { data: targets, error: fetchError } = await supabase
        .from("installments")
        .select("id, status")
        .in("id", oldInstallmentIds)
        .eq("org_id", orgId);

    if (fetchError || !targets) throw new Error("Failed to fetch installments for validation");

    const alreadyProcessed = targets.filter(t => ['paid', 'renegotiated'].includes(t.status));
    if (alreadyProcessed.length > 0) {
        console.warn(`[Action:Renegotiate] Blocked - Installments already processed: ${alreadyProcessed.map(i => i.id).join(', ')}`);
        // We can return a specific error or throw.
        throw new Error("Some installments are already paid or renegotiated. Please refresh.");
    }

    // 2. Mark old as renegotiated
    const { error: updateError } = await supabase
        .from("installments")
        .update({ status: "renegotiated" })
        .in("id", oldInstallmentIds)
        .eq("org_id", orgId);

    if (updateError) throw new Error("Failed to update old installments");

    // 3. Insert new installments
    const { error: insertError } = await supabase
        .from("installments")
        .insert(newInstallmentsData.map(inst => ({
            ...inst,
            org_id: orgId,
            status: "pending"
        })));

    if (insertError) throw new Error("Failed to create new installments");

    console.info(`[Action:Renegotiate] Success - Created ${newInstallmentsData.length} new installments.`);

    // 4. Audit Log
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

    await createNotification({
        org_id: orgId,
        title: "Reparcelamento Realizado",
        message: `O plano de pagamento da matrícula foi renegociado com sucesso.`,
        type: "warning",
        link: `/app/enrollments/${enrollmentId}`
    });

    return { success: true };
}

export async function markInstallmentPaid(
    orgId: string,
    installmentId: string,
    enrollmentId: string,
    paidAt: Date,
    method: string,
    receiptPath?: string
) {
    const supabase = await createClient(); // Fixed await
    console.info(`[Action:MarkPaid] Start - Installment: ${installmentId}`);

    const user = (await supabase.auth.getUser()).data.user;

    // 1. Idempotency Check
    const { data: current, error: fetchError } = await supabase
        .from("installments")
        .select("status")
        .eq("id", installmentId)
        .eq("org_id", orgId)
        .single();

    if (fetchError || !current) throw new Error("Installment not found");

    if (current.status === 'paid') {
        console.warn(`[Action:MarkPaid] Idempotent skip - Already paid.`);
        return { success: true, message: "Already paid" };
    }

    // 2. Update
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

    console.info(`[Action:MarkPaid] Success - Marked ${installmentId} as paid.`);

    await supabase.from("audit_logs").insert({
        org_id: orgId,
        entity: "installment",
        entity_id: installmentId,
        action: "mark_paid",
        details: JSON.stringify({ paid_at: paidAt, method }),
        actor_id: user?.id
    });

    revalidatePath(`/app/enrollments/${enrollmentId}`);

    await createNotification({
        org_id: orgId,
        title: "Pagamento Confirmado",
        message: `Um pagamento foi marcado como pago manualmente via sistema.`,
        type: "success",
        link: `/app/enrollments/${enrollmentId}`
    });

    return { success: true };
}
