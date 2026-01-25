import { getActiveOrganization } from "@/actions/organization";
import { getDashboardMetrics, getRecentSales } from "@/actions/dashboard";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const org = await getActiveOrganization();

    if (!org) {
        // If no org active, user middleware should have caught this, but safe fallback
        redirect("/app/onboarding");
    }

    // Fetch Real Data in Parallel
    const [metrics, recentSales] = await Promise.all([
        getDashboardMetrics(org.id),
        getRecentSales(org.id)
    ]);

    return (
        <DashboardClient
            metrics={metrics}
            recentSales={recentSales}
        />
    );
}

