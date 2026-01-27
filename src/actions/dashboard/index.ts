"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardMetrics {
    totalPaid: number;          // Total Recebido (Mês)
    pendingNext7Days: number;   // A Receber (7d)
    totalOverdue: number;       // Total Vencido
    totalRevenue: number;       // Faturamento Total (Vendas)
    revenueChange: number;
    // New Fields
    totalOrders: number;
    ordersChange: number;
    netRevenue: number;
    netRevenueChange: number;
    activeRate: string;
    chartData: { name: string; total: number }[];
}

export interface RecentSale {
    id: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    initials: string;
    date: string;
    status: string;
}

export async function getDashboardMetrics(orgId: string): Promise<DashboardMetrics> {
    const supabase = await createClient();

    try {
        // Date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

        // 1. Total Recebido (Mês Atual)
        const { data: paidMonth } = await supabase
            .from("receivables")
            .select("amount_cents")
            .eq("org_id", orgId)
            .eq("status", "paid")
            .gte("due_date", startOfMonth);

        // 1b. Total Recebido (Mês Anterior) - for Net Revenue Change
        const { data: lastMonthPaid } = await supabase
            .from("receivables")
            .select("amount_cents")
            .eq("org_id", orgId)
            .eq("status", "paid")
            .gte("due_date", startOfLastMonth)
            .lte("due_date", endOfLastMonth);

        // 2. A Receber (Próximos 7 dias)
        const next7Days = new Date();
        next7Days.setDate(next7Days.getDate() + 7);
        const { data: pending7d } = await supabase
            .from("receivables")
            .select("amount_cents")
            .eq("org_id", orgId)
            .eq("status", "pending")
            .lte("due_date", next7Days.toISOString())
            .gte("due_date", now.toISOString());

        // 3. Total Vencido
        const { data: overdue } = await supabase
            .from("receivables")
            .select("amount_cents")
            .eq("org_id", orgId)
            .eq("status", "pending")
            .lt("due_date", now.toISOString());

        // 4. Faturamento (Vendas - Month over Month)
        const { data: currentMonthEvents } = await supabase
            .from("external_events_normalized")
            .select("*")
            .eq("org_id", orgId)
            .eq("canonical_type", "sales.order.paid")
            .gte("created_at", startOfMonth);

        const { data: lastMonthEvents } = await supabase
            .from("external_events_normalized")
            .select("*")
            .eq("org_id", orgId)
            .eq("canonical_type", "sales.order.paid")
            .gte("created_at", startOfLastMonth)
            .lte("created_at", endOfLastMonth);

        // Calculations Helpers
        const sumCents = (arr: any[] | null) => (arr || []).reduce((acc, curr) => acc + (curr.amount_cents || 0), 0);
        const sumEvents = (arr: any[] | null) => (arr || []).reduce((acc, evt) => acc + (evt.money_amount_cents || 0), 0);
        const calcChange = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        // ... existing code ...

        const totalPaid = sumCents(paidMonth);
        const totalPaidLastMonth = sumCents(lastMonthPaid);

        const pendingNext7Days = sumCents(pending7d);
        const totalOverdue = sumCents(overdue);
        // ... existing code ...

        const currentRevenue = sumEvents(currentMonthEvents);
        const lastRevenue = sumEvents(lastMonthEvents);

        const currentOrdersCount = (currentMonthEvents || []).length;
        const lastOrdersCount = (lastMonthEvents || []).length;

        // ... existing code ...

        return {
            totalPaid: totalPaid / 100,
            pendingNext7Days: pendingNext7Days / 100,
            totalOverdue: totalOverdue / 100,
            totalRevenue: currentRevenue / 100,
            revenueChange: calcChange(currentRevenue, lastRevenue),
            // New Fields
            totalOrders: currentOrdersCount,
            ordersChange: calcChange(currentOrdersCount, lastOrdersCount),
            netRevenue: totalPaid / 100,
            netRevenueChange: calcChange(totalPaid, totalPaidLastMonth),
            activeRate: "98.5%", // Placeholder for now
            chartData
        };
    } catch (error) {
        console.error("Dashboard Metadata Error:", error);
        return {
            totalPaid: 0,
            pendingNext7Days: 0,
            totalOverdue: 0,
            totalRevenue: 0,
            revenueChange: 0,
            totalOrders: 0,
            ordersChange: 0,
            netRevenue: 0,
            netRevenueChange: 0,
            activeRate: "0%",
            chartData: []
        };
    }
}

export async function getRecentSales(orgId: string): Promise<RecentSale[]> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("external_events_normalized")
        .select("*")
        .eq("org_id", orgId)
        .eq("canonical_type", "sales.order.paid")
        .order("created_at", { ascending: false })
        .limit(5);

    if (!data) return [];

    return data.map(evt => {
        const payload = evt.canonical_payload || {};
        const customer = payload.customer || {};
        const name = customer.name || "Cliente Desconhecido";

        return {
            id: evt.id,
            customerName: name,
            customerEmail: customer.email || "email@oculto.com",
            amount: (evt.money_amount_cents || payload.money?.amount_cents || 0) / 100,
            initials: name.substring(0, 2).toUpperCase(),
            date: new Date(evt.created_at).toLocaleDateString('pt-BR'),
            status: "Pago"
        };
    });
}

export interface OnboardingStatus {
    hasIntegrations: boolean;
    hasCustomers: boolean;
    hasTeam: boolean;
    hasWebhooks: boolean;
}

export async function getOnboardingStatus(orgId: string): Promise<OnboardingStatus> {
    const supabase = await createClient();

    const [
        { count: customersCount },
        { count: teamCount },
        { count: webhooksCount },
        { data: projects }
    ] = await Promise.all([
        supabase.from("customers").select("*", { count: 'exact', head: true }).eq("org_id", orgId),
        supabase.from("memberships").select("*", { count: 'exact', head: true }).eq("org_id", orgId),
        supabase.from("webhook_inbox").select("*", { count: 'exact', head: true }).eq("org_id", orgId),
        supabase.from("projects").select("id").eq("org_id", orgId)
    ]);

    const projectIds = (projects || []).map(p => p.id);
    let realIntegrationsCount = 0;

    if (projectIds.length > 0) {
        const { count } = await supabase
            .from("gateway_integrations")
            .select("*", { count: 'exact', head: true })
            .in("project_id", projectIds);
        realIntegrationsCount = count || 0;
    }

    return {
        hasIntegrations: realIntegrationsCount > 0,
        hasCustomers: (customersCount || 0) > 0,
        hasTeam: (teamCount || 0) > 1, // More than just me
        hasWebhooks: (webhooksCount || 0) > 0
    };
}
