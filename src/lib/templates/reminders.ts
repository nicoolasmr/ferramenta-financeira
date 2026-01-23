export interface ReminderTemplate {
    id: string;
    label: string;
    subject: string;
    body: string; // Supports {name}, {value}, {dueDate} variables
}

export const REMINDER_TEMPLATES: ReminderTemplate[] = [
    {
        id: 'friendly',
        label: 'Friendly Reminder (0-15 days)',
        subject: 'Friendly Reminder: Invoice Payment',
        body: "Hi {name},\n\nHope you're doing well!\n\nThis is just a friendly reminder that invoice for R$ {value} is due on {dueDate}. If you've already sent payment, please disregard this message.\n\nThanks,\nFinance Team"
    },
    {
        id: 'overdue',
        label: 'Overdue Notice (15-30 days)',
        subject: 'Overdue Invoice Reminder',
        body: "Hello {name},\n\nWe haven't received payment for the invoice of R$ {value} due on {dueDate}.\n\nPlease let us know if there's any issue or when we can expect payment.\n\nRegards,\nFinance Team"
    },
    {
        id: 'urgent',
        label: 'Urgent: Payment Required (30+ days)',
        subject: 'URGENT: Outstanding Payment',
        body: "Dear {name},\n\nYour account shows an outstanding balance of R$ {value} which is now significantly overdue (Due: {dueDate}).\n\nPlease settle this immediately to avoid service interruption.\n\nFinance Team"
    }
];
