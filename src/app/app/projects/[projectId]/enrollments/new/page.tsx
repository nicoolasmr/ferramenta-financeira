"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, Calculator, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NewEnrollmentPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const [step, setStep] = useState(1);

    // Mock Form State
    const [formData, setFormData] = useState({
        customer: "",
        niche: "",
        total: 10000,
        entry: 2000,
        installments: 4,
        firstDue: "2026-02-10"
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="max-w-3xl mx-auto py-8 flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/app/projects/${projectId}/enrollments`}>
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">New Enrollment</h1>
                    <p className="text-muted-foreground">Add a student to this project.</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? 'bg-primary text-primary-foreground border-primary' : ''}`}>1</div>
                    <span className="font-medium text-sm">Customer</span>
                </div>
                <Separator className="w-8" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? 'bg-primary text-primary-foreground border-primary' : ''}`}>2</div>
                    <span className="font-medium text-sm">Cycle</span>
                </div>
                <Separator className="w-8" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 3 ? 'bg-primary text-primary-foreground border-primary' : ''}`}>3</div>
                    <span className="font-medium text-sm">Finances</span>
                </div>
            </div>

            {/* Step Content */}
            <Card>
                {step === 1 && (
                    <>
                        <CardHeader>
                            <CardTitle>Select Customer</CardTitle>
                            <CardDescription>Choose an existing customer or create a new one.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Customer</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, customer: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a customer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cust_1">Alice Smith (alice@example.com)</SelectItem>
                                        <SelectItem value="cust_2">Bob Jones (bob@example.com)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="link" className="w-fit p-0 h-auto">Or create new customer</Button>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end border-t pt-4">
                            <Button onClick={nextStep}>Next: Cycle</Button>
                        </CardFooter>
                    </>
                )}

                {step === 2 && (
                    <>
                        <CardHeader>
                            <CardTitle>Cycle Details</CardTitle>
                            <CardDescription>Define the mentorship period and niche.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Niche / Topic</Label>
                                <Input placeholder="e.g. Fitness Marketing" onChange={e => setFormData({ ...formData, niche: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>End Date</Label>
                                    <Input type="date" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between border-t pt-4">
                            <Button variant="outline" onClick={prevStep}>Back</Button>
                            <Button onClick={nextStep}>Next: Finances</Button>
                        </CardFooter>
                    </>
                )}

                {step === 3 && (
                    <>
                        <CardHeader>
                            <CardTitle>Payment Plan</CardTitle>
                            <CardDescription>Configure how this customer will pay.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Total Value (R$)</Label>
                                    <Input type="number" defaultValue={formData.total} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Entry Payment (R$)</Label>
                                    <Input type="number" defaultValue={formData.entry} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Installments</Label>
                                    <Input type="number" defaultValue={formData.installments} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>First Due Date</Label>
                                    <Input type="date" defaultValue={formData.firstDue} />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-50 p-4 rounded-md border text-sm space-y-2">
                                <div className="flex items-center gap-2 font-medium text-slate-700">
                                    <Calculator className="h-4 w-4" />
                                    Simulation:
                                </div>
                                <div className="flex justify-between">
                                    <span>Entry</span>
                                    <span className="font-bold">R$ 2.000,00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>4x Installments</span>
                                    <span className="font-bold">R$ 2.000,00</span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due dates: Feb 10, Mar 10, Apr 10, May 10
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between border-t pt-4">
                            <Button variant="outline" onClick={prevStep}>Back</Button>
                            <Button className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm Enrollment
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    );
}
