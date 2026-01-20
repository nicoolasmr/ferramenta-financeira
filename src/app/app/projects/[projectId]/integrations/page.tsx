"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROVIDERS } from "@/lib/integrations/manager";
import { Plus } from "lucide-react";

export default function ProjectIntegrationsPage({ params }: { params: { projectId: string } }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Project Integrations</h2>
                <p className="text-sm text-muted-foreground">Map external products to this project.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PROVIDERS.map(p => (
                    <Card key={p.id}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                {p.name}
                            </CardTitle>
                            <CardDescription>Product Mapping</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground italic">0 products mapped</span>
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" /> Map Product
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
