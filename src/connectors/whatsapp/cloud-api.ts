/**
 * WhatsApp Cloud API Connector
 * Handles sending templates and receiving status callbacks.
 */

import crypto from "crypto";

export interface WhatsAppTemplateVar {
    type: 'text';
    text: string;
}

export class WhatsAppCloudAPI {
    private accessToken: string;
    private phoneNumberId: string;
    private apiVersion: string;

    constructor() {
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
        this.apiVersion = "v18.0";
    }

    /**
     * Send a template message to a customer
     */
    async sendTemplate(
        to: string,
        templateName: string,
        languageCode: string = "pt_BR",
        components: any[] = []
    ): Promise<{ message_id: string }> {
        if (!this.accessToken || !this.phoneNumberId) {
            console.warn("WhatsAppCloudAPI: Missing credentials, mock mode.");
            return { message_id: `wamid.HBgL${crypto.randomUUID()}` };
        }

        const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: to.replace(/\D/g, ""), // ensure only digits
                type: "template",
                template: {
                    name: templateName,
                    language: { code: languageCode },
                    components: components
                }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`WhatsApp API Error: ${JSON.stringify(data)}`);
        }

        return { message_id: data.messages[0].id };
    }

    /**
     * Map internal template keys to Meta template names
     */
    static getMetaTemplateName(internalKey: string): string {
        const mapping: Record<string, string> = {
            'friendly_reminder': 'revenueos_friendly_remind',
            'due_today': 'revenueos_due_today',
            'overdue_3_days': 'revenueos_overdue_3d',
            'payment_confirmation': 'revenueos_paid_confirm'
        };
        return mapping[internalKey] || internalKey;
    }
}
