"use client";

import { ChatInterface } from "@/components/copilot/chat-interface";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function ProjectAIPage({ params }: { params: { projectId: string } }) {
    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-200px)]">
            <div>
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Project Analysis & Data Entry
                </h2>
                <p className="text-sm text-muted-foreground">Ask questions about this project's revenue or register new sales.</p>
            </div>

            <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 h-full">
                    <ChatInterface mode="project" projectId={params.projectId} />
                </CardContent>
            </Card>
        </div>
    );
}
