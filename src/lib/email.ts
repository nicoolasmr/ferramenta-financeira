import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'onboarding@resend.dev'; // Default until domain verified
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendInviteEmail(to: string, token: string, orgName: string, inviterName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY missing. Printing invite link to console.");
        console.log(`✉️ [MOCK EMAIL] To: ${to} | Link: ${APP_URL}/invite/${token}`);
        return;
    }

    const inviteLink = `${APP_URL}/invite/${token}`;

    try {
        const { data, error } = await resend.emails.send({
            from: `RevenueOS <${FROM_EMAIL}>`,
            to: [to],
            subject: `Convite para participar de ${orgName} no RevenueOS`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Você foi convidado! 🚀</h1>
                    <p><strong>${inviterName}</strong> convidou você para fazer parte da organização <strong>${orgName}</strong> no RevenueOS.</p>
                    <p>Clique no botão abaixo para aceitar:</p>
                    <a href="${inviteLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Aceitar Convite</a>
                    <p style="margin-top: 24px; color: #666; font-size: 14px;">Ou cole este link no navegador: <br> ${inviteLink}</p>
                    <p style="margin-top: 48px; font-size: 12px; color: #999;">RevenueOS - Automação Financeira</p>
                </div>
            `
        });

        if (error) {
            console.error("Email API Error:", error);
            throw new Error("Failed to send email");
        }

        console.log("Email sent successfully:", data);
    } catch (e) {
        console.error("Failed to send invite email:", e);
        // Don't block the flow, just log
    }
}
