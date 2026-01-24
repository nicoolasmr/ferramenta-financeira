
/**
 * Canonical Modules Domain Definitions
 */

// Module: Sales (Orders, Payments, Installments)
export type CanonicalSalesType =
    | 'sales.order.created'
    | 'sales.order.paid'
    | 'sales.order.canceled'
    | 'sales.payment.succeeded'
    | 'sales.payment.failed'
    | 'sales.installment.created'
    | 'sales.installment.paid'
    | 'sales.installment.overdue';

// Module: Subscriptions
export type CanonicalSubscriptionType =
    | 'subscriptions.created'
    | 'subscriptions.renewed'
    | 'subscriptions.canceled'
    | 'subscriptions.past_due';

// Module: Payouts
export type CanonicalPayoutType =
    | 'payouts.paid'
    | 'payouts.failed';

// Module: Disputes/Refunds
export type CanonicalDisputeType =
    | 'disputes.opened'
    | 'disputes.won'
    | 'disputes.lost'
    | 'refunds.created'
    | 'refunds.settled';

// Module: Commissions
export type CanonicalCommissionType =
    | 'commissions.created'
    | 'commissions.settled'
    | 'commissions.chargeback_adjusted';

// Module: Open Finance
export type CanonicalOpenFinanceType =
    | 'open_finance.account.synced'
    | 'open_finance.transaction.created'
    | 'open_finance.transaction.updated';

export type CanonicalModule = 'sales' | 'subscriptions' | 'payouts' | 'disputes' | 'commissions' | 'open_finance';

export type CanonicalType =
    | CanonicalSalesType
    | CanonicalSubscriptionType
    | CanonicalPayoutType
    | CanonicalDisputeType
    | CanonicalCommissionType
    | CanonicalOpenFinanceType;
