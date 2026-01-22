"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { processChatMessage } from "@/actions/copilot/chat-action";
import { AIEnrollmentSchema, AIMessage } from "@/lib/ai/schemas";
import { createEnrollmentPlan } from "@/actions/copilot/create-enrollment-plan";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Send, Sparkles, User, Bot, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/components/providers/OrganizationProvider";

type Message = {
    role: "user" | "assistant";
    content: string;
    intent?: "CHAT" | "PREVIEW_ENROLLMENT";
    data?: any;
};

export function ChatInterface({
    mode = "global",
    projectId
}: {
    mode?: "global" | "project" | "wizard",
    projectId?: string
}) {
    const { activeOrganization } = useOrganization();
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I am your Financial Copilot. How can I help you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setLoading(true);

        try {
            // Convert to simple AIMessage for server
            const history: AIMessage[] = messages.concat(newMsg).map(m => ({ role: m.role, content: m.content }));

            // Pass context to server action
            const response = await processChatMessage(history, activeOrganization?.id || "org-1", mode, projectId);

            setMessages(prev => [...prev, {
                role: "assistant",
                content: response.text,
                intent: response.intent as any,
                data: response.data
            }]);
        } catch (e) {
            toast.error("Failed to process message");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmEnrollment = async (data: any) => {
        try {
            const result = await createEnrollmentPlan(data, activeOrganization?.id || "org-1");
            if (result.success) {
                toast.success("Enrollment created successfully!");
                setMessages(prev => [...prev, { role: "assistant", content: "Enrollment Confirmed & Created! 🚀" }]);
            }
        } catch (e: any) {
            toast.error("Error creating enrollment: " + e.message);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                            {m.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}

                            <div className={cn(
                                "rounded-lg p-3 max-w-[80%] text-sm",
                                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-white border shadow-sm"
                            )}>
                                {m.content}

                                {m.intent === "PREVIEW_ENROLLMENT" && m.data && (
                                    <div className="mt-3 bg-slate-50 p-3 rounded border text-slate-800">
                                        <div className="flex items-center gap-2 mb-2 font-medium">
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                            Preview Enrollment
                                        </div>
                                        <div className="space-y-1 text-xs mb-3">
                                            <p><span className="text-muted-foreground">Customer:</span> {m.data.customer.name}</p>
                                            <p><span className="text-muted-foreground">Plan:</span> {m.data.plan.total_amount} BRL in {m.data.plan.installments_count}x</p>
                                        </div>
                                        <Button size="sm" onClick={() => handleConfirmEnrollment(m.data)} className="w-full">
                                            <Check className="w-4 h-4 mr-2" />
                                            Confirm Creation
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {m.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-slate-500" />
                                </div>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="bg-white border shadow-sm rounded-lg p-3">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>
            <div className="p-4 border-t bg-white">
                <div className="max-w-3xl mx-auto flex gap-2">
                    <Input
                        placeholder={mode === 'wizard' ? "Ex: Enrollment for Joao, 5000 in 10x" : "Type a message..."}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        disabled={loading}
                    />
                    <Button onClick={handleSend} disabled={loading || !input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
