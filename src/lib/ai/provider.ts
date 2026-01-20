import { AIMessage, AIEnrollmentSchema } from "./schemas";

export interface AIProvider {
    chat(messages: AIMessage[]): Promise<string>;
    extractEnrollment(text: string): Promise<any>; // Returns partial AIEnrollment
}

class MockAIProvider implements AIProvider {
    async chat(messages: AIMessage[]): Promise<string> {
        const lastMsg = messages[messages.length - 1].content.toLowerCase();

        // Simple heuristics for Mock Mode
        if (lastMsg.includes("health") || lastMsg.includes("saúde")) {
            return "ANALYSIS:HEALTH_CHECK";
        }
        if (lastMsg.includes("novo") || lastMsg.includes("criar") || lastMsg.includes("add")) {
            return "WIZARD:START";
        }

        return "I am the Copilot Mock. I can help you create enrollments or check financial health. Try typing 'Novo mentorado' or 'Health check'.";
    }

    async extractEnrollment(text: string): Promise<any> {
        // Regex heuristics to extract data from text
        // E.g. "Novo mentorado João Silva valor 5000 em 10x"

        const nameMatch = text.match(/mentorado\s+([A-Za-z\s]+?)(?=\s+valor|\s+em|$)/i);
        const valueMatch = text.match(/valor\s+(\d+)/i);
        const installmentsMatch = text.match(/em\s+(\d+)x/i);

        return {
            customer: {
                name: nameMatch ? nameMatch[1].trim() : undefined,
            },
            plan: {
                total_amount: valueMatch ? parseInt(valueMatch[1]) : undefined,
                installments_count: installmentsMatch ? parseInt(installmentsMatch[1]) : 1,
            }
        };
    }
}

// Factory to switch providers
export const getAIProvider = (): AIProvider => {
    // In future, check process.env.AI_PROVIDER
    return new MockAIProvider();
};
