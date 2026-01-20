"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { impersonateUserAction } from "./actions";

export default function ImpersonationPage() {
    const [targetEmail, setTargetEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleImpersonate() {
        setLoading(true);
        try {
            const res = await impersonateUserAction(targetEmail);
            if (res.success) {
                toast.success("Impersonation Logged", { description: "Session started (Audit Logged)." });
                // In a real app, we'd redirect or reload with new cookie.
            } else {
                toast.error("Failed", { description: res.error });
            }
        } catch (e) {
            toast.error("Error", { description: "Network error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>User Impersonation</CardTitle>
                <CardDescription>Access user account for support. Action is AUDITED.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Target User Email</label>
                    <Input
                        placeholder="user@example.com"
                        value={targetEmail}
                        onChange={e => setTargetEmail(e.target.value)}
                    />
                </div>
                <Button className="w-full" variant="destructive" onClick={handleImpersonate} disabled={loading || !targetEmail}>
                    {loading ? "Starting..." : "Start Impersonation Mode"}
                </Button>
            </CardContent>
        </Card>
    );
}
