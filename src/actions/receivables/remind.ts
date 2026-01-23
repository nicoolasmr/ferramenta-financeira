"use server";

import { createClient } from "@/lib/supabase/server";
import { REMINDER_TEMPLATES } from "@/lib/templates/reminders";
import { revalidatePath } from "next/cache";

export async function sendEmailReminder(
    receivableId: string,
    templateId: string
) {
    const supabase = await createClient();

    // 1. Fetch Receivable & Customer Details
    const { data: receivable, error: fetchError } = await supabase
        .from('receivables')
        .select(`
            *,
            customer:customers(name, email, phone)
        `)
        .eq('id', receivableId)
        .single();

    if (fetchError || !receivable) throw new Error("Receivable not found");

    const template = REMINDER_TEMPLATES.find(t => t.id === templateId);
    if (!template) throw new Error("Invalid template");

    // 2. Prepare content
    const content = template.body
        .replace('{name}', receivable.customer?.name || 'Customer')
        .replace('{value}', Number(receivable.amount).toFixed(2))
        .replace('{dueDate}', new Date(receivable.due_date).toLocaleDateString());

    // 3. Send Email (Mock for now, or integrate Resend if configured)
    console.log(`[MOCK EMAIL] To: ${receivable.customer?.email}`);
    console.log(`[MOCK EMAIL] Subject: ${template.subject}`);
    console.log(`[MOCK EMAIL] Body: ${content}`);

    // 4. Log Interaction
    // Assuming we have a 'customer_interactions' or similar table, or just log to console for MVP
    // Ideally create an 'interactions' table. For now, let's append to a notes field or just return success.

    // 5. Update status? Maybe 'contacted'

    return { success: true, message: "Email sent (simulated)" };
}

export async function getWhatsAppLink(receivableId: string, templateId: string) {
    const supabase = await createClient();

    const { data: receivable } = await supabase
        .from('receivables')
        .select(`*, customer:customers(name, phone)`)
        .eq('id', receivableId)
        .single();

    if (!receivable) return null;

    const template = REMINDER_TEMPLATES.find(t => t.id === templateId);
    if (!template) return null;

    const content = template.body
        .replace('{name}', receivable.customer?.name || 'Customer')
        .replace('{value}', Number(receivable.amount).toFixed(2))
        .replace('{dueDate}', new Date(receivable.due_date).toLocaleDateString());

    const phone = receivable.customer?.phone?.replace(/\D/g, '');
    if (!phone) return null;

    return `https://wa.me/${phone}?text=${encodeURIComponent(content)}`;
}
