import { addMonths, setDate, getDate, addDays, lastDayOfMonth } from 'date-fns';

export type ScheduleRule = {
    rule_type: 'fixed_day_of_month' | 'days_after_entry' | 'custom_first_due';
    due_day?: number; // 1..31
    interval_months?: number; // default 1
    first_due_date?: Date; // used if rule_type = 'custom_first_due'
    days_after?: number; // used if rule_type = 'days_after_entry' (e.g. 30 days after entry)
    anchor?: 'entry_paid_at' | 'cycle_start' | 'manual_date';
    manual_anchor_date?: Date;
    rounding_policy?: 'last_installment_adjust'; // default
};

export type GenerateInstallmentsParams = {
    total_amount_cents: number;
    entry_amount_cents: number;
    installments_count: number;
    schedule_rule: ScheduleRule;
    entry_paid_at?: Date;
    cycle_start?: Date;
};

export type CalculatedInstallment = {
    installment_number: number;
    amount_cents: number;
    due_date: Date;
    status: 'pending';
};

export function generateInstallments(params: GenerateInstallmentsParams): CalculatedInstallment[] {
    const {
        total_amount_cents,
        entry_amount_cents,
        installments_count,
        schedule_rule,
        entry_paid_at,
        cycle_start,
    } = params;

    if (installments_count <= 0) return [];

    const principal = total_amount_cents - entry_amount_cents;
    // Floor division to get base amount
    const baseAmount = Math.floor(principal / installments_count);
    const remainder = principal - (baseAmount * installments_count);

    // Determine Anchor Date
    let anchorDate: Date;
    if (schedule_rule.anchor === 'manual_date' && schedule_rule.manual_anchor_date) {
        anchorDate = new Date(schedule_rule.manual_anchor_date);
    } else if (schedule_rule.anchor === 'cycle_start' && cycle_start) {
        anchorDate = new Date(cycle_start);
    } else if (schedule_rule.anchor === 'entry_paid_at' && entry_paid_at) {
        anchorDate = new Date(entry_paid_at);
    } else {
        // Fallback if no anchor provided but required by logic: use today
        anchorDate = new Date();
    }

    const installments: CalculatedInstallment[] = [];
    const interval = schedule_rule.interval_months ?? 1;

    for (let i = 1; i <= installments_count; i++) {
        let dueDate: Date;

        // --- Date Calculation Logic ---
        if (schedule_rule.rule_type === 'custom_first_due' && schedule_rule.first_due_date) {
            // First installment is fixed, others follow interval
            if (i === 1) {
                dueDate = new Date(schedule_rule.first_due_date);
            } else {
                // Add (i-1) * interval months to the first due date
                // We need to respect the day of the first due date.
                const firstDate = new Date(schedule_rule.first_due_date);
                dueDate = addMonths(firstDate, (i - 1) * interval);
            }
        } else if (schedule_rule.rule_type === 'days_after_entry') {
            // e.g. 30 days after entry/anchor
            const daysToAdd = schedule_rule.days_after ?? 30; // Default 30 if missing
            if (i === 1) {
                dueDate = addDays(anchorDate, daysToAdd);
            } else {
                // For subsequent, we can either add 30 days cumulatively or add months
                // Standard practice usually implies monthly recurrence after the first one
                // Let's assume monthly recurrence based on the first calculated date
                const firstDueDate = addDays(anchorDate, daysToAdd);
                dueDate = addMonths(firstDueDate, (i - 1) * interval);
            }
        } else {
            // Default: 'fixed_day_of_month'
            // Logic: specific day of next month(s) relative to anchor
            // If anchor is Jan 15, and due_day is 10. First due is Feb 10? Or Jan 10 (past)?
            // Usually: Next occurrence of due_day after anchor. 
            // OR: Simpler: Anchor + 1 month, set date to due_day.

            const targetDay = schedule_rule.due_day ?? getDate(anchorDate);

            // Start from next month of anchor to ensure it's in the future/next cycle
            // But if we want immediate execution? Usually payment plans start "next month".
            // Let's implement: Month (Anchor + i). Day (targetDay).
            // e.g. i=1 (first installment). Anchor Jan. Result Feb.

            let targetDateBase = addMonths(anchorDate, i); // basic +i months
            // But wait, if rule is "fixed_day_of_month", we usually blindly force the day.
            // What if user wants first installment in CURRENT month? 
            // Usually that's the "Entry". The installments follow.

            // Edge case: Short months.
            // built-in addMonths handles this?
            // date-fns addMonths(Jan 31, 1) -> Feb 28. Perfect.
            // But if we use setDate manually, we break it. 

            // Better approach:
            // 1. Add (i) months to anchor.
            // 2. Set the day to targetDay.
            // 3. Check validity.

            // Actually, safer approach for "Fixed Day":
            // Get strict month offset.
            // Force the day.

            // Let's try: Anchor Month + i.
            const futureMonth = addMonths(anchorDate, i);

            // Now force the day.
            // If targetDay > daysInMonth, use last day.
            const lastDay = lastDayOfMonth(futureMonth);
            const maxDay = getDate(lastDay);

            const actualDay = Math.min(targetDay, maxDay);
            dueDate = setDate(futureMonth, actualDay);
        }

        // --- Amount Logic ---
        let amount = baseAmount;
        // Apply rounding adjustment to last installment
        if (i === installments_count) {
            amount = baseAmount + remainder;
        }

        installments.push({
            installment_number: i,
            amount_cents: amount,
            due_date: dueDate,
            status: 'pending'
        });
    }

    return installments;
}
