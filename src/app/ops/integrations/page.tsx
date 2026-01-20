"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function IntegrationsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stripe */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Stripe
                            <Badge>Active</Badge>
                        </CardTitle>
                        <CardDescription>Payment processing globally.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Switch id="stripe-mode" checked />
                            <Label htmlFor="stripe-mode">Enabled</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Configure</Button>
                    </CardFooter>
                </Card>

                {/* Pagar.me */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Pagar.me
                            <Badge>Active</Badge>
                        </CardTitle>
                        <CardDescription>Local payments for Brazil (Pix/Boleto).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Switch id="pagarme-mode" checked />
                            <Label htmlFor="pagarme-mode">Enabled</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Configure</Button>
                    </CardFooter>
                </Card>

                {/* Hubspot */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Hubspot
                            <Badge variant="secondary">Inactive</Badge>
                        </CardTitle>
                        <CardDescription>CRM synchronization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <Switch id="hubspot-mode" />
                            <Label htmlFor="hubspot-mode">Enabled</Label>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full">Configure</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
