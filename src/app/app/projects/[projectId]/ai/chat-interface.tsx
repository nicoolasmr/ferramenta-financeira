"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Bot, User as UserIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ProjectAIChatInterface() {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: "Hello! I'm your AI Analyst. How can I help you today? I can analyze revenue trends, suggest improvements, or draft emails." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        setIsLoading(true);

        // Mock AI Response for MVP
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: `I'm analyzing the data for "${userMsg}"... \n\n(Mock) Based on current trends, your project revenue is up 15% this week. Consider increasing ad spend on the top-performing creative.` }]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <Card className="flex-1 flex flex-col min-h-0">
            <CardContent className="flex-1 flex flex-col p-4 gap-4 min-h-0">
                <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-none", m.role === 'assistant' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                    {m.role === 'assistant' ? <Bot size={16} /> : <UserIcon size={16} />}
                                </div>
                                <div className={cn("rounded-lg p-3 max-w-[80%] text-sm", m.role === 'assistant' ? "bg-muted" : "bg-primary text-primary-foreground")}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-none">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-muted rounded-lg p-3 text-sm animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="flex gap-2 pt-2 border-t">
                    <Input
                        placeholder="Ask anything..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <Button onClick={handleSend} disabled={isLoading} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
