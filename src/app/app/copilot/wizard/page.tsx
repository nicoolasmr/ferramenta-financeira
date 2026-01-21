
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RefreshCcw } from "lucide-react";

type Message = {
    role: 'assistant' | 'user';
    content: string;
    options?: string[]; // Quick replies
};

// Deterministic State Machine for "New Sale"
export default function WizardChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I am your Deal Wizard. What would you like to do today?", options: ["New Sale", "New Enrollment"] }
    ]);
    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const handleSend = async (text: string) => {
        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        // Simulate "Thinking" (Deterministic logic)
        setTimeout(() => {
            processStep(text);
            setLoading(false);
        }, 600);
    };

    const processStep = (lastInput: string) => {
        let nextMsg: Message = { role: 'assistant', content: "" };

        // State Machine
        if (step === 0) {
            if (lastInput.toLowerCase().includes("sale") || lastInput.toLowerCase().includes("enroll")) {
                nextMsg = { role: 'assistant', content: "Great! First, what is the **Customer Name**?" };
                setStep(1);
            } else {
                nextMsg = { role: 'assistant', content: "I didn't catch that. Please select an option.", options: ["New Sale", "New Enrollment"] };
            }
        } else if (step === 1) {
            setData({ ...data, customerName: lastInput });
            nextMsg = { role: 'assistant', content: `Nice to meet ${lastInput}. What is their **Email**?` };
            setStep(2);
        } else if (step === 2) {
            setData({ ...data, email: lastInput });
            nextMsg = { role: 'assistant', content: "Got it. What is the **Product Name** or **Offer**?" };
            setStep(3);
        } else if (step === 3) {
            setData({ ...data, product: lastInput });
            nextMsg = { role: 'assistant', content: "And the **Total Price** (in cents)? (e.g. 10000 for R$ 100,00)" };
            setStep(4);
        } else if (step === 4) {
            setData({ ...data, price: lastInput });
            nextMsg = { role: 'assistant', content: "How many **Installments**?", options: ["1", "6", "12"] };
            setStep(5);
        } else if (step === 5) {
            setData({ ...data, installments: lastInput });
            nextMsg = {
                role: 'assistant', content: "Review Details:\n" +
                    `- Customer: ${data.customerName} (${data.email})\n` +
                    `- Product: ${data.product}\n` +
                    `- Price: ${data.price}\n` +
                    `- Plan: ${lastInput}x\n\n` +
                    "Does this look correct?", options: ["Yes, Create Deal", "Cancel"]
            };
            setStep(6);
        } else if (step === 6) {
            if (lastInput.toLowerCase().includes("yes")) {
                nextMsg = { role: 'assistant', content: "✅ Deal Created Successfully! (Mock ID: #12345). You can see it in the Sales Dashboard." };
                // Here we would call a Server Action to actually insert DB Rows
                setStep(0); // Reset or End
            } else {
                nextMsg = { role: 'assistant', content: "Cancelled. Returning to start.", options: ["New Sale"] };
                setStep(0);
                setData({});
            }
        }

        setMessages(prev => [...prev, nextMsg]);
    };

    return (
        <Card className="w-full max-w-lg mx-auto h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5 text-primary" />
                    Deal Wizard
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="flex justify-start"><div className="bg-muted rounded-lg p-3"><Loader2 className="w-4 h-4 animate-spin" /></div></div>}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 p-4 bg-slate-50 border-t">
                {messages[messages.length - 1]?.options ? (
                    <div className="flex gap-2 w-full overflow-x-auto pb-2">
                        {messages[messages.length - 1].options!.map(opt => (
                            <Button key={opt} variant="outline" size="sm" onClick={() => handleSend(opt)}>
                                {opt}
                            </Button>
                        ))}
                    </div>
                ) : null}
                <form className="flex w-full gap-2" onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleSend(input); }}>
                    <Input
                        placeholder="Type your answer..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading || (messages[messages.length - 1]?.options?.length || 0) > 0}
                    />
                    <Button type="submit" disabled={loading || !input.trim()}>Send</Button>
                </form>
            </CardFooter>
        </Card>
    );
}
