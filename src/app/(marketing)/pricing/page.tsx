import { PublicHeader } from "@/components/layout/public-header";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const plans = [
        {
            name: "Starter",
            price: "R$ 49",
            description: "For solopreneurs and early-stage startups.",
            features: ["Up to 5 Projects", "Basic Analytics", "Stripe Integration", "Email Support"]
        },
        {
            name: "Pro",
            price: "R$ 149",
            description: "For growing businesses seeking scale.",
            features: ["Unlimited Projects", "AI Analyst", "All Integrations (Stripe, Hotmart, Asaas)", "Priority Support", "Advanced Reporting"]
        },
        {
            name: "Agency",
            price: "R$ 499",
            description: "Manage multiple organizations and custom flows.",
            features: ["Unlimited Everything", "White-label Options", "Dedicated Success Manager", "API Access", "SSO"]
        }
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <PublicHeader />
            <main className="flex-1 container py-12">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-12">
                    <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl">Simple, Transparent Pricing</h1>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Choose the plan that fits your growth stage.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div key={plan.name} className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </div>
                            <div className="my-6">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <ul className="mb-6 space-y-2 text-sm text-muted-foreground flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center">
                                        <Check className="mr-2 h-4 w-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/signup">
                                <Button className="w-full">Get Started</Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
