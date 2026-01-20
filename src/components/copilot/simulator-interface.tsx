"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"; // Need to check if this exists or use Input for now
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { processSimulation } from "@/actions/copilot/finance-actions";
import { toast } from "sonner";

export function SimulatorInterface() {
    const [rate, setRate] = useState([10]); // 10%
    const [delay, setDelay] = useState([15]); // 15 days
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleRun = async () => {
        setLoading(true);
        try {
            const res = await processSimulation("org-1", {
                monthsHorizon: 30,
                defaultRate: rate[0] / 100,
                delayDaysAvg: delay[0]
            });
            setResult(res);
            toast.success("Simulation complete");
        } catch (e) {
            toast.error("Simulation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" /> Scenario Config
                    </CardTitle>
                    <CardDescription>Adjust variables to forecast next 30 days revenue.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Default Rate (Inadimplência): {rate}%</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0" max="50"
                                value={rate[0]}
                                onChange={e => setRate([Number(e.target.value)])}
                                className="w-full"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Percentage of revenue likely to be lost.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Avg. Delay (Days): {delay} days</Label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0" max="60"
                                value={delay[0]}
                                onChange={e => setDelay([Number(e.target.value)])}
                                className="w-full"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Average days late for "Pending" payments.</p>
                    </div>

                    <Button onClick={handleRun} disabled={loading} className="w-full">
                        {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        Run Simulation
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-slate-50 border-dashed">
                <CardHeader>
                    <CardTitle>Forecast Results</CardTitle>
                </CardHeader>
                <CardContent>
                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                            <Calculator className="h-10 w-10 mb-2 opacity-20" />
                            <p>Run a scenario to see impact.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Baseline (Next 30d)</p>
                                <p className="text-2xl font-bold">R$ {(result.baseline / 100).toLocaleString('pt-BR')}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-red-100 rounded-lg text-red-700">
                                    <div className="flex items-center gap-1 mb-1">
                                        <TrendingDown className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase">Proj. Loss</span>
                                    </div>
                                    <p className="text-lg font-bold">- R$ {(result.lost / 100).toLocaleString('pt-BR')}</p>
                                </div>

                                <div className="p-3 bg-orange-100 rounded-lg text-orange-800">
                                    <div className="flex items-center gap-1 mb-1">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase">Delayed</span>
                                    </div>
                                    <p className="text-lg font-bold">R$ {(result.delayed / 100).toLocaleString('pt-BR')}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium text-muted-foreground">Realizable Revenue</p>
                                <p className="text-3xl font-bold text-slate-900">R$ {(result.simulated / 100).toLocaleString('pt-BR')}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
