
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Lock } from "lucide-react";

const PROVIDERS = [
    { key: "stripe", name: "Stripe", category: "Payments", tiers: ["Starter", "Pro", "Enterprise"], status: "Live" },
    { key: "hotmart", name: "Hotmart", category: "Digital Products", tiers: ["Starter", "Pro", "Enterprise"], status: "Live" },
    { key: "asaas", name: "Asaas", category: "Payments (BR)", tiers: ["Pro", "Enterprise"], status: "Live" },
    { key: "kiwify", name: "Kiwify", category: "Courses", tiers: ["Pro", "Enterprise"], status: "Live" },
    { key: "belvo", name: "Belvo", category: "Open Finance", tiers: ["Enterprise"], status: "Stub" },
];

export default function IntegrationsCatalogPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto py-12 px-4">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-black">Integrations Marketplace</h1>
                <p className="text-xl text-muted-foreground">Expand your RevenueOS with native connectors.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {PROVIDERS.map(p => (
                    <Card key={p.key} className="hover:shadow-lg transition-all">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{p.name}</CardTitle>
                                <Badge variant={p.status === 'Live' ? 'secondary' : 'outline'}>{p.status}</Badge>
                            </div>
                            <CardDescription>{p.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {p.tiers.map(t => (
                                    <Badge key={t} variant="outline" className="text-xs bg-slate-50">{t}</Badge>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            {p.tiers.includes("Starter") ? (
                                <Button className="w-full gap-2">Read Docs <ArrowRight className="w-4 h-4" /></Button>
                            ) : (
                                <Button variant="secondary" className="w-full gap-2"><Lock className="w-4 h-4" /> Upgrade to Connect</Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-8 text-center mt-12">
                <h3 className="text-2xl font-bold mb-4">Build your own Integration</h3>
                <p className="text-slate-300 mb-6">Use our open-source SDK to connect any provider.</p>
                <Button variant="outline" className="text-black bg-white hover:bg-slate-200">View Developer Docs</Button>
            </div>
        </div>
    );
}
