"use client";

import { CreditCard, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const currentPlan = {
    name: "Pro",
    price: 299,
    billingCycle: "monthly",
    nextBilling: "2024-02-22",
};

const invoices = [
    { id: 1, date: "2024-01-22", amount: 299, status: "paid", downloadUrl: "#" },
    { id: 2, date: "2023-12-22", amount: 299, status: "paid", downloadUrl: "#" },
    { id: 3, date: "2023-11-22", amount: 299, status: "paid", downloadUrl: "#" },
];

export default function BillingPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
                <p className="text-slate-500">Manage your subscription and invoices</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>You are currently on the {currentPlan.name} plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="text-2xl font-bold">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(currentPlan.price)}
                            </h3>
                            <p className="text-sm text-slate-500">per {currentPlan.billingCycle}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Next billing date:</span>
                        <span className="font-medium">{currentPlan.nextBilling}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">Change Plan</Button>
                        <Button variant="outline" className="text-red-600">
                            Cancel Subscription
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Manage your payment information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-slate-600" />
                            <div>
                                <p className="font-medium">•••• •••• •••• 4242</p>
                                <p className="text-sm text-slate-500">Expires 12/2025</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            Update
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>{invoices.length} invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{invoice.date}</p>
                                        <p className="text-sm text-slate-500">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(invoice.amount)}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
