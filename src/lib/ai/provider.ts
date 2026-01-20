import { AIMessage, AIEnrollmentSchema } from "./schemas";

export type AIContext = {
    mode: "global" | "project" | "wizard";
    projectId?: string;
    orgId: string;
};

export interface AIProvider {
    chat(messages: AIMessage[], context: AIContext): Promise<string>;
    extractEnrollment(text: string): Promise<any>; // Returns partial AIEnrollment
}

class MockAIProvider implements AIProvider {
    async chat(messages: AIMessage[], context: AIContext): Promise<string> {
        const lastMsg = messages[messages.length - 1].content.toLowerCase();

        // 1. Wizard Mode (Data Entry)
        if (context.mode === "wizard") {
            if (lastMsg.includes("reset")) return "WIZARD:RESET";
            // In a real scenario, this would track state. 
            // Here we assume the client handles the conversational state flow or we return prompts.
            return "I'm ready to register a new sale. Please provide: Customer Name, Product, Value, Installments.";
        }

        // 2. Project Analysis
        if (context.mode === "project" && context.projectId) {
            if (lastMsg.includes("risk") || lastMsg.includes("risco")) {
                return `[Project ${context.projectId}] Analysis: There is a 15% increase in overdue payments this week. Recommend contacting 5 clients.`;
            }
            return `[Project ${context.projectId}] I am your Project Analyst. Ask me about sales, overdue payments, or churn.`;
        }

        // 3. Global Portfolio
        if (lastMsg.includes("health") || lastMsg.includes("saúde")) {
            return "ANALYSIS:HEALTH_CHECK";
        }

        return "I am the RevenueOS Copilot. I can help you with Global Insights, Project Analysis, or Data Entry. Where should we start?";
    }

    async extractEnrollment(text: string): Promise<any> {
        // Regex heuristics to extract data from text
        // E.g. "Novo mentorado João Silva valor 5000 em 10x no pix"

        const nameMatch = text.match(/mentorado\s+([A-Za-z\s]+?)(?=\s+valor|\s+em|$)/i);
        const valueMatch = text.match(/valor\s+(\d+)/i);
        const installmentsMatch = text.match(/em\s+(\d+)x/i);
        const methodMatch = text.match(/no\s+(pix|boleto|cartão)/i);

        return {
            customer: {
                name: nameMatch ? nameMatch[1].trim() : undefined,
            },
            plan: {
                total_amount: valueMatch ? parseInt(valueMatch[1]) : undefined,
                installments_count: installmentsMatch ? parseInt(installmentsMatch[1]) : 1,
            },
            method: methodMatch ? methodMatch[1] : 'credit_card'
        };
    }
}

// Factory to switch providers
export const getAIProvider = (): AIProvider => {
    // In future, check process.env.AI_PROVIDER
    return new MockAIProvider();
};
