"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileSpreadsheet, Calculator, MessageSquare, ListChecks, FileText } from "lucide-react";
import { ChatInterface } from "@/components/copilot/chat-interface";
import { ImportInterface } from "@/components/copilot/import-interface";

export default function CopilotPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                    Copilot
                </h1>
                <p className="text-muted-foreground">
                    Your financial assistant and operational wizard.
                </p>
            </div>

            <Tabs defaultValue="chat" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="import">Import</TabsTrigger>
                    <TabsTrigger value="simulator">Simulator</TabsTrigger>
                    <TabsTrigger value="collections">Collections</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="space-y-4">
                    <ChatInterface />
                </TabsContent>

                <TabsContent value="import" className="space-y-4">
                    <Card className="h-[400px] flex flex-col justify-center items-center text-muted-foreground">
                        <FileSpreadsheet className="h-12 w-12 mb-4 opacity-50" />
                        <p>Bulk Import coming soon...</p>
                    </Card>
                </TabsContent>

                <TabsContent value="simulator" className="space-y-4">
                    <Card className="h-[400px] flex flex-col justify-center items-center text-muted-foreground">
                        <Calculator className="h-12 w-12 mb-4 opacity-50" />
                        <p>Cash Simulator coming soon...</p>
                    </Card>
                </TabsContent>

                <TabsContent value="collections" className="space-y-4">
                    <Card className="h-[400px] flex flex-col justify-center items-center text-muted-foreground">
                        <ListChecks className="h-12 w-12 mb-4 opacity-50" />
                        <p>Collections & Aging coming soon...</p>
                    </Card>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                    <Card className="h-[400px] flex flex-col justify-center items-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4 opacity-50" />
                        <p>Templates Manager coming soon...</p>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
