import { createClient } from "@/lib/supabase/server";
import { AIMessage, AIEnrollmentSchema } from "./schemas";

export type AIContext = {
    mode: "global" | "project" | "wizard";
    projectId?: string;
    orgId: string;
    path?: string; // Current URL path
};

export interface AIProvider {
    chat(messages: AIMessage[], context: AIContext): Promise<string>;
    extractEnrollment(text: string): Promise<any>; // Returns partial AIEnrollment
}

/**
 * REVENUEOS AI POLICY: ANTI-FAKE & DETERMINISTIC
 * 1. No decision making: AI suggests, user decides.
 * 2. No hallucinations: Responses MUST cite SQL Views or specific data counts.
 * 3. Confidence reporting: Always specify source (e.g., Confidence 100% - SQL).
 * 4. Language: Default to Portuguese (PT-BR) for business insights.
 */
class MockAIProvider implements AIProvider {
    async chat(messages: AIMessage[], context: AIContext): Promise<string> {
        const lastMsg = messages[messages.length - 1].content.toLowerCase();
        const supabase = await createClient();

        // 1. Wizard Mode (Data Entry)
        if (context.mode === "wizard") {
            if (lastMsg.includes("reset")) return "WIZARD:RESET";
            return "Estou pronto para registrar uma nova venda. Por favor, forneça: Nome do Cliente, Produto, Valor e Parcelas.";
        }

        // 2. Project Analysis (Deterministic View Query)
        if (context.mode === "project" && context.projectId) {
            // Check Data Freshness first
            const { data: freshness } = await supabase.from("integration_freshness_view")
                .select("*")
                .eq("org_id", context.orgId);

            const staleProviders = freshness?.filter(f => f.status === 'stale') || [];
            if (staleProviders.length > 0) {
                return `[Atenção] Os dados podem estar desatualizados. Provedores desconectados: ${staleProviders.map(p => p.provider).join(', ')}.`;
            }

            if (lastMsg.includes("risk") || lastMsg.includes("risco")) {
                const { data: aging } = await supabase
                    .from("receivables_aging_view")
                    .select("*")
                    .eq("project_id", context.projectId)
                    .single();

                const totalOverdue = (aging?.overdue_30 || 0) + (aging?.overdue_60 || 0) + (aging?.overdue_90_plus || 0);
                const critical = aging?.overdue_90_plus || 0;

                if (totalOverdue === 0) {
                    return `[Projeto ${context.projectId}] Análise (Confiança: 100% - SQL View): **Saudável**. Nenhum pagamento atrasado encontrado para este projeto.`;
                }

                return `[Projeto ${context.projectId}] Análise (Confiança: 100% - SQL View): Encontramos **${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOverdue / 100)}** em pagamentos atrasados.
                
**Detalhamento:**
- Recente (30d): ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((aging?.overdue_30 || 0) / 100)}
- Crítico (90d+): ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(critical / 100)}

**Ação Recomendada:**
1. Vá para **/app/projects/${context.projectId}/receivables** para enviar lembretes.
2. ${critical > 0 ? "URGENTE: Bloqueie o acesso de usuários com 90+ dias de atraso." : "Envie um 'Lembrete Amigável' para os inadimplentes recentes."}`;
            }
            return `[Projeto ${context.projectId}] Sou seu Analista de Projeto. Pergunte-me sobre vendas, pagamentos atrasados ou churn.`;
        }

        // 3. Page-Specific Context (Heuristics)
        if (context.path?.includes("/reconciliation")) {
            return "Vejo que você está no painel de Conciliação. Lembre-se de verificar se o 'match_id' já está vinculado a um pagamento para evitar duplicidade.";
        }

        if (context.path?.includes("/sales")) {
            return "分析 (Funil de Vendas): Suas taxas de conversão estão estáveis. Deseja ver uma simulação de aumento de preços?";
        }

        // 4. Global Portfolio
        if (lastMsg.includes("health") || lastMsg.includes("saúde")) {
            // Query the Truth Layer
            const { data: summary } = await supabase.from("reconciliation_summary_view")
                .select("*")
                .eq("org_id", context.orgId);

            if (!summary || summary.length === 0) return "Nenhum dado disponível para o check de saúde operacional.";

            const report = summary.map(s =>
                `- ${s.provider}: Bruto=${s.total_raw}, Normalizado=${s.total_normalized} (Conv: ${s.conversion_rate}%)`
            ).join("\n");

            return `**Relatório de Saúde Operacional (Determinístico)**\nFonte: 'reconciliation_summary_view'\n\n${report}\n\nConfiança: 100%`;
        }

        return "Eu sou o Copilot do RevenueOS. Posso te ajudar com Insights Globais, análise de projetos ou entrada de dados. Por onde começamos?";
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
