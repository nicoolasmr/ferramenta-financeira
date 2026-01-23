/**
 * Recovery Rules Engine (Deterministic)
 * Decides the next action for a collection case based on specific rules.
 */

export type PaymentMethod = 'pix' | 'boleto' | 'credit_card';

export interface RecoveryState {
    daysOverdue: number;
    paymentMethod: PaymentMethod;
    customerRiskScore: number; // 0-100
    hasWhatsAppOptIn: boolean;
}

export type RecoveryAction =
    | 'SEND_WHATSAPP_TEMPLATE'
    | 'SEND_EMAIL_LINK'
    | 'OFFER_RENEGOTIATION'
    | 'ESCALATE_TO_AGENT'
    | 'WAIT';

export function getNextRecoveryAction(state: RecoveryState): { action: RecoveryAction; template?: string } {
    const { daysOverdue, paymentMethod, hasWhatsAppOptIn, customerRiskScore } = state;

    // Rule 1: High Risk + Overdue > 7 days -> Immediate Human Escalation
    if (customerRiskScore > 80 && daysOverdue > 7) {
        return { action: 'ESCALATE_TO_AGENT' };
    }

    // Rule 2: Just overdue (1-3 days) -> Friendly Reminder
    if (daysOverdue > 0 && daysOverdue <= 3) {
        if (hasWhatsAppOptIn) {
            return { action: 'SEND_WHATSAPP_TEMPLATE', template: 'friendly_reminder' };
        }
        return { action: 'SEND_EMAIL_LINK' };
    }

    // Rule 3: Mid-term overdue (4-10 days) -> Harder approach + Renegotiation offer
    if (daysOverdue > 3 && daysOverdue <= 10) {
        if (paymentMethod === 'pix' || paymentMethod === 'boleto') {
            return { action: 'OFFER_RENEGOTIATION' };
        }
        return { action: 'SEND_WHATSAPP_TEMPLATE', template: 'overdue_notice' };
    }

    // Rule 4: Long-term overdue (> 10 days) -> Human intervention
    if (daysOverdue > 10) {
        return { action: 'ESCALATE_TO_AGENT' };
    }

    return { action: 'WAIT' };
}
