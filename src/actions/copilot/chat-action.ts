"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider, AIContext } from "@/lib/ai/provider";
import { AIMessage } from "@/lib/ai/schemas";
import { createNotification } from "@/actions/notifications";

export async function processChatMessage(
    messages: AIMessage[],
    orgId: string,
    contextMode: "global" | "project" | "wizard" = "global",
    projectId?: string,
    path?: string
) {
    const ai = getAIProvider();
    const context: AIContext = { mode: contextMode, orgId, projectId, path };

    // Log intent to DB (omitted for MVP speed, but part of spec)

    const replyText = await ai.chat(messages, context);

    // Heuristic: If we are in WIZARD mode, likely extracting data
    if (contextMode === "wizard" || messages[messages.length - 1].content.toLowerCase().includes("novo")) {
        const lastUserMsg = messages[messages.length - 1].content;
        const extracted = await ai.extractEnrollment(lastUserMsg);

        // If we have at least Name and Amount, offer Preview
        if (extracted.customer?.name && extracted.plan?.total_amount) {
            await createNotification({
                org_id: orgId,
                title: "IA: Novo Plano Proposto",
                message: `Identificamos uma oportunidade de matrícula para ${extracted.customer.name} no valor de R$ ${extracted.plan.total_amount}.`,
                type: "info",
                link: `/app/copilot`
            });

            return {
                text: "I've drafted a new enrollment based on your request. Please review and confirm.",
                intent: "PREVIEW_ENROLLMENT",
                data: { ...extracted, project_id: projectId } // Attach current project context if any
            };
        }
    }

    return {
        text: replyText,
        intent: "CHAT",
        data: null
    };
}
