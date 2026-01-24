
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inspectLineage } from "@/actions/consistency";

export default function LineageOpsPage() {
    const [id, setId] = useState("");
    const [result, setResult] = useState<any>(null);

    const handleInspect = async () => {
        if (!id) return;
        const res = await inspectLineage('order', id); // Defaulting to order for MVP GUI
        setResult(res);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-black">Data Lineage</h1>
                <p className="text-muted-foreground">Trace entity origins.</p>
            </div>

            <div className="flex gap-4">
                <Input placeholder="Enter Canonical ID (UUID)" value={id} onChange={e => setId(e.target.value)} />
                <Button onClick={handleInspect}>Inspect</Button>
            </div>

            {result && (
                <Card>
                    <CardHeader><CardTitle>Result</CardTitle></CardHeader>
                    <CardContent>
                        <pre className="bg-slate-950 text-white p-4 rounded text-xs font-mono">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
