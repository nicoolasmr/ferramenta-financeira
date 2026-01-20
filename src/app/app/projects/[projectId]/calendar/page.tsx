"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function ProjectCalendarPage({ params }: { params: { projectId: string } }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Installments Calendar</h2>
                <p className="text-sm text-muted-foreground">Visualize upcoming payments.</p>
            </div>

            <Card className="min-h-[400px] flex items-center justify-center border-dashed">
                <div className="text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Calendar View Coming Soon</p>
                    <p className="text-xs">This feature will visualize installment due dates.</p>
                </div>
            </Card>
        </div>
    );
}
