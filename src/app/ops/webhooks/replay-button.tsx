"use client";

import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReplayButton({ orgId, provider, eventId }: { orgId: string, provider: string, eventId: string }) {
    const [loading, setLoading] = useState(false);

    async function handleReplay() {
        setLoading(true);
        try {
            const res = await fetch("/api/ops/replay", {
                method: "POST",
                body: JSON.stringify({ orgId, provider, eventId }),
            });
            if (res.ok) {
                toast.success("Replay Successful", { description: "Event re-processed." });
                window.location.reload();
            } else {
                const txt = await res.text();
                toast.error("Replay Failed", { description: txt });
            }
        } catch (e) {
            toast.error("Error", { description: "Network error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleReplay} disabled={loading} title="Replay Event">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        </Button>
    );
}
