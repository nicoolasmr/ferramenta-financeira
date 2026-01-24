
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertTriangle, Check } from "lucide-react";

type WhyContextType = {
    inspect: (entityType: string, entityId: string, context?: string) => void;
};

const WhyContext = createContext<WhyContextType | undefined>(undefined);

export function useWhy() {
    const context = useContext(WhyContext);
    if (!context) throw new Error("useWhy must be used within WhyProvider");
    return context;
}

export function WhyProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [target, setTarget] = useState<{ type: string; id: string; context?: string } | null>(null);

    const inspect = async (type: string, id: string, context?: string) => {
        setTarget({ type, id, context });
        setIsOpen(true);
        setLoading(true);

        try {
            // Fetch lineage data from API (we need to implement this endpoint later)
            // const res = await fetch(\`/api/ops/lineage?entity=\${type}&id=\${id}\`);
            // const json = await res.json();
            // setData(json);

            // Mock for MVP until API is ready
            setTimeout(() => {
                setData({
                    summary: "This value is derived from 3 confirmed orders.",
                    ledger_impact: [
                        { date: "2024-01-20", category: "sale", amount: 10000, direction: "credit" },
                        { date: "2024-01-21", category: "sale", amount: 5000, direction: "credit" }
                    ],
                    raw_events: [
                        { id: "evt_1", provider: "stripe", type: "charge.succeeded", created_at: "2024-01-20T10:00:00Z" }
                    ]
                });
                setLoading(false);
            }, 800);

        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <WhyContext.Provider value={{ inspect }}>
            {children}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="sm:max-w-xl w-[90vw]">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs uppercase font-bold">Why?</span>
                            Explainability Engine
                        </SheetTitle>
                        <SheetDescription>
                            Traceability for {target?.type} {target?.id}
                        </SheetDescription>
                    </SheetHeader>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="mt-6 space-y-6">
                            <div className="p-4 bg-muted/30 rounded-lg border">
                                <h4 className="font-semibold mb-1 text-sm">Decision Context</h4>
                                <p className="text-sm text-muted-foreground">{data?.summary}</p>
                            </div>

                            <Tabs defaultValue="ledger">
                                <TabsList className="w-full">
                                    <TabsTrigger value="ledger" className="flex-1">Ledger</TabsTrigger>
                                    <TabsTrigger value="raw" className="flex-1">Raw Proof</TabsTrigger>
                                    <TabsTrigger value="logic" className="flex-1">Logic</TabsTrigger>
                                </TabsList>
                                <TabsContent value="ledger">
                                    <ScrollArea className="h-[300px] border rounded-md p-2">
                                        <div className="space-y-2">
                                            {data?.ledger_impact?.map((entry: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center p-2 bg-card border rounded shadow-sm text-sm">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium capitalize">{entry.category}</span>
                                                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                                                    </div>
                                                    <Badge variant={entry.direction === "credit" ? "default" : "secondary"}>
                                                        {entry.direction === "credit" ? "+" : "-"}
                                                        {(entry.amount / 100).toFixed(2)}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                                <TabsContent value="raw">
                                    <ScrollArea className="h-[300px] border rounded-md p-4">
                                        <pre className="text-xs text-muted-foreground font-mono">
                                            {JSON.stringify(data?.raw_events, null, 2)}
                                        </pre>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </WhyContext.Provider>
    );
}
