"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SyncButton() {
    const [loading, setLoading] = useState(false);

    async function handleSync() {
        setLoading(true);
        try {
            // We use the Cron API path for manual trigger too, logic is same.
            const res = await fetch("/api/cron/sync");
            const data = await res.json();

            if (res.ok) {
                toast.success("Sync Completed", {
                    description: `Processed: ${data.processed}, Errors: ${data.errors}`
                });
            } else {
                toast.error("Sync Failed", { description: "Server error" });
            }
        } catch (e) {
            toast.error("Error", { description: "Network error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button variant="secondary" size="sm" onClick={handleSync} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Run Sync
        </Button>
    );
}
