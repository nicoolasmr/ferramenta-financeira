import { isAfter, addDays, startOfDay, parseISO } from 'date-fns';

export function calculateInstallmentStatus(
    installment: { status: string; due_date: string | Date; paid_at?: string | Date | null },
    graceDays: number = 0
): 'pending' | 'overdue' | 'paid' | 'renegotiated' {
    // If already paid or renegotiated, respect DB status
    if (installment.status === 'paid' || installment.status === 'renegotiated') {
        return installment.status as 'paid' | 'renegotiated';
    }

    // If status is 'pending' or 'overdue', we re-calculate dynamically
    // based on today vs due_date + grace
    const today = startOfDay(new Date());

    const dueDate = typeof installment.due_date === 'string'
        ? parseISO(installment.due_date)
        : installment.due_date;

    const overdueDate = addDays(dueDate, graceDays);

    if (isAfter(today, overdueDate)) {
        return 'overdue';
    }

    return 'pending';
}
