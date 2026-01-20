import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Admin access for verification

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase Credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyFinancials() {
    console.log("🔍 Starting Financial Consistency Check...");

    // 1. Fetch Aggregated View Data
    const { data: viewData, error: viewError } = await supabase
        .from("project_financials_view")
        .select("*");

    if (viewError) {
        console.error("❌ Failed to fetch View:", viewError.message);
        process.exit(1);
    }

    // 2. Iterate each project and manually aggregate raw tables
    let hasError = false;

    for (const viewRow of viewData) {
        console.log(`\nChecking Project: ${viewRow.project_name} (${viewRow.project_id})`);

        // Fetch Installments & Plans
        const { data: plans, error: plansError } = await supabase
            .from("payment_plans")
            .select(`
        id, 
        total_amount_cents, 
        entry_amount_cents, 
        entry_status,
        enrollments!inner(project_id)
      `)
            .eq("enrollments.project_id", viewRow.project_id);

        if (plansError) {
            console.error(`   ❌ Error fetching plans:`, plansError);
            hasError = true; continue;
        }

        const planIds = plans.map(p => p.id);

        // Fetch Installments
        const { data: installments, error: instError } = await supabase
            .from("installments")
            .select("amount_cents, status")
            .in("plan_id", planIds);

        if (instError) {
            console.error(`   ❌ Error fetching installments:`, instError);
            hasError = true; continue;
        }

        // --- MANUAL AGGREGATION ---
        // Sold: Sum of all plans total
        const calcSold = plans.reduce((acc, p) => acc + p.total_amount_cents, 0);

        // Received: Entry (if paid) + Installments (paid)
        let calcReceived = 0;
        plans.forEach(p => {
            if (p.entry_status === 'paid') calcReceived += (p.entry_amount_cents || 0);
        });
        installments.forEach(i => {
            if (i.status === 'paid') calcReceived += i.amount_cents;
        });

        // Overdue: Installments overdue
        const calcOverdue = installments
            .filter(i => i.status === 'overdue')
            .reduce((acc, i) => acc + i.amount_cents, 0);

        // Open: Pending + Overdue
        const calcOpen = installments
            .filter(i => ['pending', 'overdue'].includes(i.status))
            .reduce((acc, i) => acc + i.amount_cents, 0);

        // --- COMPARISON ---
        const check = (label: string, atomic: number, view: number) => {
            if (atomic !== view) {
                console.error(`   ❌ Mismatch [${label}]: Raw=${atomic}, View=${view}`);
                hasError = true;
            } else {
                console.log(`   ✅ Match [${label}]: ${atomic}`);
            }
        };

        check("Total Sold", calcSold, viewRow.total_sold);
        check("Total Received", calcReceived, viewRow.total_received);
        check("Total Overdue", calcOverdue, viewRow.total_overdue);
        check("Total Open", calcOpen, viewRow.total_open);
    }

    if (hasError) {
        console.error("\n❌ Verification FAILED with inconsistencies.");
        process.exit(1);
    } else {
        console.log("\n✅ Verification PASSED: All views match atomic data.");
        process.exit(0);
    }
}

verifyFinancials();
