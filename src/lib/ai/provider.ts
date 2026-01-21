import { createClient } from "@/lib/supabase/server";
import { AIEnrollment, AIMessage } from "./schemas";

export type AIContext = {
    mode: "global" | "project" | "wizard";
    projectId?: string;
    orgId: string;
};

export interface AIProvider {
    chat(messages: AIMessage[], context: AIContext): Promise<string>;
    extractEnrollment(text: string): Promise<Partial<AIEnrollment>>; // Returns partial AIEnrollment
}

class MockAIProvider implements AIProvider {
    async chat(messages: AIMessage[], context: AIContext): Promise<string> {
        const lastMsg = messages[messages.length - 1].content.toLowerCase();
        const supabase = await createClient();

        // 1. Wizard Mode (Data Entry)
        if (context.mode === "wizard") {
            if (lastMsg.includes("reset")) return "WIZARD:RESET";
            return "I'm ready to register a new sale. Please provide: Customer Name, Product, Value, Installments.";
        }

        // 2. Project Analysis (Deterministic View Query)
        if (context.mode === "project" && context.projectId) {
            // Check Data Freshness first
            const { data: freshness } = await supabase.from("integration_freshness_view")
                .select("*")
                .eq("org_id", context.orgId);

            const staleProviders = freshness?.filter(f => f.status === 'stale') || [];
            if (staleProviders.length > 0) {
                return `[WARNING] Data might be outdated. Providers disconnected: ${staleProviders.map(p => p.provider).join(', ')}.`;
            }

            if (lastMsg.includes("risk") || lastMsg.includes("risco")) {
                return `[Project ${context.projectId}] Analysis (Confidence: 100% - SQL View): There is a 15% increase in overdue payments this week. Recommend contacting 5 clients.
                
**Top 3 Actions:**
1. **Cobrança**: Send "Lembrete Amigável" to John Doe (Assumido risco baixo).
2. **Engajamento**: User Mary is inactive for 10 days. Check in.
3. **Cash Flow**: Prepare forecast for next Friday.`;
            }
            return `[Project ${context.projectId}] I am your Project Analyst. Ask me about sales, overdue payments, or churn.`;
        }

        // 3. Global Portfolio
        if (lastMsg.includes("health") || lastMsg.includes("saúde")) {
            // Query the Truth Layer
            const { data: summary } = await supabase.from("reconciliation_summary_view")
                .select("*")
                .eq("org_id", context.orgId);

            if (!summary || summary.length === 0) return "No data available for health check.";

            const report = summary.map(s =>
                `- ${s.provider}: Raw=${s.total_raw}, Normalized=${s.total_normalized} (Conv: ${s.conversion_rate}%)`
            ).join("\n");

            return `**Operational Health Report (Deterministic)**\nData Source: 'reconciliation_summary_view'\n\n${report}\n\nConfidence: 100%`;
        }

        return "I am the RevenueOS Copilot. I can help you with Global Insights, Project Analysis, or Data Entry. Where should we start?";
    }

    async extractEnrollment(text: string): Promise<Partial<AIEnrollment>> {
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
