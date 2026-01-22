import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const plans = [
    {
        code: "starter",
        name: "Starter",
        price_cents: 9900,
        currency: "BRL",
        limits: { projects: 5, users: 2 },
        features: { items: ["5 Projects", "2 Team Members", "Basic Support", "Standard API"] }
    },
    {
        code: "pro",
        name: "Professional",
        price_cents: 29900,
        currency: "BRL",
        limits: { projects: 20, users: 10 },
        features: { items: ["Unlimited Projects", "10 Team Members", "Priority Support", "Advanced Analytics", "MFA Security"] }
    },
    {
        code: "agency",
        name: "Enterprise",
        price_cents: 99900,
        currency: "BRL",
        limits: { projects: 100, users: 50 },
        features: { items: ["Custom Limits", "Unlimited Members", "Dedicated Support", "White-labeling", "Custom API"] }
    }
];

async function seed() {
    console.log("Seeding plans...");
    const { error } = await supabase.from("plans").upsert(plans, { onConflict: "code" });
    if (error) {
        console.error("Error seeding plans:", error);
    } else {
        console.log("Plans seeded successfully!");
    }
}

seed();
