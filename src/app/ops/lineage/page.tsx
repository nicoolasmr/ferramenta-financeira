
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, FileJson, Database, CheckCircle } from "lucide-react";

export default function LineageExplorerPage() {
    const [traceId, setTraceId] = useState("");
    const [result, setResult] = useState<any>(null);

    const handleSearch = () => {
        // Mock result for demo
        if (!traceId) return;
        setResult({
            traceId,
            steps: [
                { stage: "Ingestion", timestamp: "10:42:01", status: "success", detail: "Received from Webhook" },
                { stage: "Normalization", timestamp: "10:42:02", status: "success", detail: "Mapped to Standard Schema" },
                { stage: "Processing", timestamp: "10:42:03", status: "success", detail: "Saved to Ledger" },
                { stage: "Post-Processing", timestamp: "10:42:04", status: "success", detail: "Dunning Checked (No Action)" }
            ]
        });
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-12">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">Event Lineage Explorer</h1>
                <p className="text-muted-foreground">Trace any event from ingestion to ledger to prove integrity.</p>
            </div>

            <div className="flex gap-4">
                <Input
                    placeholder="Enter Trace ID (e.g. evt_123...)"
                    value={traceId}
                    onChange={(e) => setTraceId(e.target.value)}
                />
                <Button onClick={handleSearch}><Search className="w-4 h-4 mr-2" /> Trace</Button>
            </div>

            {result && (
                <div className="relative border-l-2 border-slate-200 ml-6 space-y-8 pl-8 py-4">
                    {result.steps.map((step: any, i: number) => (
                        <div key={i} className="relative">
                            <div className="absolute -left-[41px] top-0 bg-white border-2 border-slate-200 rounded-full w-6 h-6 flex items-center justify-center">
                                {step.status === 'success' && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                            </div>
                            <Card>
                                <CardHeader className="py-4">
                                    <div className="flex justify-between">
                                        <CardTitle className="text-base font-bold">{step.stage}</CardTitle>
                                        <span className="text-xs text-muted-foreground font-mono">{step.timestamp}</span>
                                    </div>
                                    <CardDescription>{step.detail}</CardDescription>
                                </CardHeader>
                            </Card>
                            {i < result.steps.length - 1 && (
                                <div className="absolute left-[50%] -bottom-6 text-slate-300">
                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="pt-4">
                        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-center gap-3">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">Transaction Confirmed in Ledger</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
