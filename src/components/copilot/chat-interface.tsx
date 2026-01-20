"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles, Check, X } from "lucide-react";
import { processChatMessage } from "@/actions/copilot/chat-action";
import { createEnrollmentPlan } from "@/actions/copilot/create-enrollment-plan";
import { toast } from "sonner";
import { AIMessage } from "@/lib/ai/schemas";

type Message = {
    role: "user" | "assistant";
    content: string;
    intent?: "PREVIEW_ENROLLMENT";
    data?: any;
};

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I am your Financial Copilot. I can help you register new enrollments or analyze your finances." }
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
            const history: AIMessage[] = [...messages, newMsg].map(m => ({ role: m.role, content: m.content }));

            // Hardcoded orgId for MVP, should come from context/auth
            const response = await processChatMessage(history, "org-1");

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
        const toastId = toast.loading("Creating enrollment...");
        try {
            await createEnrollmentPlan(data, "org-1");
            toast.success("Enrollment created successfully!", { id: toastId });
            setMessages(prev => [...prev, { role: "assistant", content: "✅ Enrollment confirmed and created." }]);
        } catch (e: any) {
            toast.error(`Error: ${e.message}`, { id: toastId });
        }
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-background shadow-sm">
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                            <Avatar className="h-8 w-8">
                                {m.role === "assistant" ? (
                                    <AvatarFallback className="bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></AvatarFallback>
                                ) : (
                                    <AvatarFallback>ME</AvatarFallback>
                                )}
                            </Avatar>
                            <div className={`space-y-2 max-w-[80%]`}>
                                <div className={`p-3 rounded-lg text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    {m.content}
                                </div>
                                {m.intent === "PREVIEW_ENROLLMENT" && m.data && (
                                    <Card className="border-primary/50 bg-primary/5">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-primary" />
                                                Draft Preview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-1 pb-2">
                                            <div><strong>Customer:</strong> {m.data.customer?.name}</div>
                                            <div><strong>Value:</strong> R$ {m.data.plan?.total_amount}</div>
                                            <div><strong>Installments:</strong> {m.data.plan?.installments_count}x</div>
                                        </CardContent>
                                        <CardFooter className="gap-2 pt-0">
                                            <Button size="sm" onClick={() => handleConfirmEnrollment(m.data)}>
                                                <Check className="mr-1 h-3 w-3" /> Confirm
                                            </Button>
                                            <Button size="sm" variant="outline">
                                                <X className="mr-1 h-3 w-3" /> Cancel
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8"><AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback></Avatar>
                            <div className="p-3 rounded-lg bg-muted flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Type a message... (e.g. 'Novo mentorado João valor 5000 em 10x')"
                />
                <Button onClick={handleSend} disabled={loading} size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
