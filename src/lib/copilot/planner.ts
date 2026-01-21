
import { ActionItem, Insight } from "./types";

export function getActionMetadata(
    actionType: ActionItem['action_type'],
    payload?: any
): { label: string; link: string; icon: string } {
    switch (actionType) {
        case 'collect_whatsapp':
            return {
                label: 'Send WhatsApp Reminder',
                link: `/app/projects/${payload?.project_id || ''}/receivables`, // Link to Collections UI
                icon: 'MessageCircle'
            };
        case 'collect_email':
            return {
                label: 'Send Email Reminder',
                link: `/app/projects/${payload?.project_id || ''}/receivables`,
                icon: 'Mail'
            };
        case 'run_sync':
            return {
                label: 'Run Integration Sync',
                link: '/ops/webhooks',
                icon: 'RefreshCw'
            };
        case 'open_reconciliation':
            return {
                label: 'Review Reconciliation',
                link: `/app/projects/${payload?.project_id || ''}/reconciliation`,
                icon: 'Scale'
            };
        case 'renegotiate':
            return {
                label: 'Offer Renegotiation',
                link: `/app/projects/${payload?.project_id || ''}/receivables`,
                icon: 'Handshake'
            };
        default:
            return { label: 'View Details', link: '#', icon: 'ArrowRight' };
    }
}

export function prioritizer(actions: ActionItem[]): ActionItem[] {
    // Determine Top 3 based on priority
    // 1. Critical Actions (Priority > 80)
    // 2. Warning Actions (Priority > 50)
    // 3. Info (Priority <= 50)
    return actions.sort((a, b) => b.priority - a.priority).slice(0, 3);
}
