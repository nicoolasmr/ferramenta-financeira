"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Calendar } from "lucide-react";

export default function OrderDetailPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/app/sales">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Order #ord_1</h1>
                    <p className="text-muted-foreground text-sm">Created on Jan 20, 2023 at 10:45 AM</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Refund</Button>
                    <Button>Send Receipt</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 bg-slate-100 rounded-md"></div>
                                    <div>
                                        <p className="font-medium">Premium Plan - Annual</p>
                                        <p className="text-sm text-muted-foreground">Pro features included</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">R$ 1.999,00</p>
                                    <p className="text-sm text-muted-foreground">Qty: 1</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline / Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="border-l-2 border-muted pl-4 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                                    <p className="font-medium">Order Paid</p>
                                    <p className="text-sm text-muted-foreground">Jan 20, 2023 - 10:45 AM</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-muted-foreground" />
                                    <p className="font-medium">Order Created</p>
                                    <p className="text-sm text-muted-foreground">Jan 20, 2023 - 10:42 AM</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase text-muted-foreground">Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">Olivia Martin</p>
                                    <p className="text-sm text-muted-foreground text-blue-600 hover:underline cursor-pointer">View profile</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid gap-1 text-sm">
                                <p className="font-medium">Contact Info</p>
                                <p className="text-muted-foreground">olivia.martin@email.com</p>
                                <p className="text-muted-foreground">+55 11 99999-9999</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase text-muted-foreground">Payment</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>R$ 1.999,00</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Taxes</span>
                                <span>R$ 0,00</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-bold">
                                <span>Total</span>
                                <span>R$ 1.999,00</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-md flex items-center gap-3 text-sm mt-2">
                                <CreditCard className="h-4 w-4" />
                                <span>Visa ending in 4242</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
