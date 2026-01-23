"use server";

import { createClient } from "@/lib/supabase/server";
import { OFXParser } from "@/lib/ofx/parser";
import { revalidatePath } from "next/cache";

export async function uploadOFX(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Get Active Org
    const { data: membership } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (!membership) throw new Error("No organization found");
    const orgId = membership.org_id;

    const file = formData.get('file') as File;
    if (!file) throw new Error("No file uploaded");

    const text = await file.text();
    const parser = new OFXParser();

    let transactions;
    try {
        transactions = parser.parse(text);
    } catch (e) {
        console.error("Parse error:", e);
        return { error: "Failed to parse OFX file. Ensure it is a valid OFX/XML format." };
    }

    if (transactions.length === 0) return { success: true, count: 0 };

    // Prepare for bulk insert with upsert (ignore duplicates by transaction_id)
    const records = transactions.map(t => ({
        org_id: orgId,
        amount: t.amount,
        date: t.date.toISOString(),
        description: t.description,
        transaction_id: t.id,
        status: 'pending' as const
    }));

    const { error, count } = await supabase
        .from('bank_transactions')
        .upsert(records, {
            onConflict: 'org_id,transaction_id',
            ignoreDuplicates: true
        });

    if (error) {
        console.error("DB Insert Error:", error);
        return { error: "Failed to save transactions." };
    }

    revalidatePath('/app/reconciliation');
    return { success: true, count: transactions.length }; // Note: upsert return count might be null depending on config
}

export async function getReconciliationStats(orgId: string) {
    const supabase = await createClient();

    // Get Pending Count
    const { count: pendingCount } = await supabase
        .from('bank_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'pending');

    // Get Matched Count
    const { count: matchedCount } = await supabase
        .from('bank_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'matched');

    return {
        pending: pendingCount || 0,
        matched: matchedCount || 0
    };
}

export async function getUnreconciledIds(orgId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('bank_transactions')
        .select('id')
        .eq('org_id', orgId)
        .eq('status', 'pending');

    return (data || []).map(r => r.id);
}

// Core Matching Logic
export async function findPotentialMatches(orgId: string, transactionId: string) {
    const supabase = await createClient();

    // 1. Get the transaction
    const { data: transaction } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

    if (!transaction) return null;

    // 2. Search for payments with same amount and date within range
    const targetDate = new Date(transaction.date);
    const minDate = new Date(targetDate);
    minDate.setDate(minDate.getDate() - 4); // +/- 4 days tolerance
    const maxDate = new Date(targetDate);
    maxDate.setDate(maxDate.getDate() + 4);

    // Note: We need to handle amount sign. OFX Debit is negative. 
    // Payments in DB usually positive. Or we store signed?
    // Let's assume Payments are positive values.
    // If transaction amount is negative (-100), we look for payment of 100.
    const searchAmount = Math.abs(transaction.amount);

    const { data: payments } = await supabase
        .from('payments')
        .select(`
            id, amount, created_at, status, description,
            customer:customers(name)
        `)
        .eq('org_id', orgId)
        .gte('created_at', minDate.toISOString())
        .lte('created_at', maxDate.toISOString())
        // We might want to filter by status too? Maybe only 'paid' or 'pending'?
        // Let's just match any payment that looks like it.
        // We verify amount logic locally or add filter.
        // Floating point comparison warning. Use range or exact string?
        // Let's try exact first.
        .eq('amount', searchAmount)
        .limit(5);

    return {
        transaction,
        candidates: payments || []
    };
}

export async function confirmMatch(transactionId: string, paymentId: string) {
    const supabase = await createClient();

    // Update Transaction
    const { error } = await supabase
        .from('bank_transactions')
        .update({
            match_id: paymentId,
            status: 'matched'
        })
        .eq('id', transactionId);

    if (error) throw error;

    // Ideally we should also mark payment as Verified or similar?
    // For now, just linking.

    revalidatePath('/app/reconciliation');
    return { success: true };
}
