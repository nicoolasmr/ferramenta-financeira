"use server";

import { createClient } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";
import { AIMessage } from "@/lib/ai/schemas";

export async function processChatMessage(messages: AIMessage[], orgId: string) {
    const ai = getAIProvider();
    const replyText = await ai.chat(messages);

    // Heuristic: If the reply suggests a "WIZARD:START" or seems to contain data,
    // we try to extract structural data to show a Preview Card.

    // In a real LLM, we would ask for JSON mode.
    // In Mock, we check if the user *provided* enough info in the LAST message.
    const lastUserMsg = messages[messages.length - 1].content;
    const extracted = await ai.extractEnrollment(lastUserMsg);

    // If we have at least a Name and an Amount, we offer a Preview
    if (extracted.customer?.name && extracted.plan?.total_amount) {
        return {
            text: "I've drafted a new enrollment based on your request. Please review and confirm.",
            intent: "PREVIEW_ENROLLMENT",
            data: extracted
        };
    }

    return {
        text: replyText,
        intent: "CHAT",
        data: null
    };
}
