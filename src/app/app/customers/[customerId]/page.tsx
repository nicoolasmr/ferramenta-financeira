"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Mail, Phone, ShoppingBag, DollarSign, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CustomerProfilePage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/app/customers">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">Olivia Martin</h1>
                    <p className="text-muted-foreground text-sm">Customer since Jan, 2023</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" size="sm">Ban Customer</Button>
                    <Button variant="outline" size="sm">Edit Profile</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-7">

                {/* Sidebar Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={`https://avatar.vercel.sh/cus_1.png`} />
                                <AvatarFallback>OM</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold">Olivia Martin</h2>
                                <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active Account</Badge>

                            <Separator />

                            <div className="w-full text-left grid gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>olivia.martin@email.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>+55 11 99999-9999</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>CPF: 123.456.789-00</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Source</span>
                                    <span className="font-medium">Organic</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Login</span>
                                    <span className="font-medium">2 hours ago</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-5 space-y-6">
                    {/* KPI Row */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lifetime Value</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">R$ 4.200,00</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">15</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0%</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="orders">
                        <TabsList>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="activity">Activity Log</TabsTrigger>
                        </TabsList>
                        <TabsContent value="orders" className="space-y-4">
                            {/* Reuse Orders Table style here ideally, simplified for now */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order History</CardTitle>
                                    <CardDescription>Recent purchases made by this customer.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium">Order #ord_{i}</p>
                                                    <p className="text-xs text-muted-foreground">Jan 20, 2023</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="outline">Paid</Badge>
                                                    <span className="font-medium text-sm">R$ {100 * i},00</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">No recent activity logged.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
