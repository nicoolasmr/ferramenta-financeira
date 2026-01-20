"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, User as UserIcon, Send, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { findProducts, findCustomers, createSale } from "./actions";
import { useRouter } from "next/navigation";

type Message = {
    role: 'assistant' | 'user';
    content: string;
    options?: { label: string; value: string }[]; // Optional quick replies
};

export default function SalesWizardPage() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I can help you register a new sale. First, what product is being sold?" }
    ]);
    const [input, setInput] = useState("");
    const [step, setStep] = useState<'product' | 'customer' | 'installments' | 'confirm'>('product');
    const [formData, setFormData] = useState({
        product: null as any,
        customer: null as any,
        installments: 1
    });
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

        // Process State Machine
        if (step === 'product') {
            const products = await findProducts(userMsg);
            if (products.length === 0) {
                setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't find any products matching that. Try 'Consulting' or 'Course'." }]);
            } else if (products.length === 1) {
                const p = products[0];
                setFormData(prev => ({ ...prev, product: p }));
                setStep('customer');
                setMessages(prev => [...prev, { role: 'assistant', content: `Selected: ${p.name} ($${p.price_cents / 100}). Now, who is the customer? (Name or Email)` }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "Found multiple products. Please type the exact name:",
                    options: products.map(p => ({ label: p.name, value: p.name }))
                }]);
            }
        }
        else if (step === 'customer') {
            const customers = await findCustomers(userMsg);
            if (customers.length === 0) {
                // Simplified: Assume creating new or ask again
                setMessages(prev => [...prev, { role: 'assistant', content: "Customer not found. (Mock) I've selected 'Guest Client' for now. How many installments?" }]);
                setFormData(prev => ({ ...prev, customer: { id: 'guest-id', name: 'Guest' } })); // Mock ID
                setStep('installments');
            } else {
                const c = customers[0];
                setFormData(prev => ({ ...prev, customer: c }));
                setStep('installments');
                setMessages(prev => [...prev, { role: 'assistant', content: `Client: ${c.name}. How many installments? (e.g. 1, 6, 12)` }]);
            }
        }
        else if (step === 'installments') {
            const num = parseInt(userMsg);
            if (isNaN(num) || num < 1) {
                setMessages(prev => [...prev, { role: 'assistant', content: "Please enter a valid number (1-12)." }]);
            } else {
                setFormData(prev => ({ ...prev, installments: num }));
                setStep('confirm');
                setMessages(prev => [...prev, { role: 'assistant', content: `Confirm Sale: \nProduct: ${formData.product?.name}\nCustomer: ${formData.customer?.name}\nInstallments: ${num}\n\nType "yes" to save.` }]);
            }
        }
        else if (step === 'confirm') {
            if (userMsg.toLowerCase().includes('yes')) {
                setMessages(prev => [...prev, { role: 'assistant', content: "Saving sale..." }]);
                // Call Server Action
                // Using mock params if form data incomplete for this demo context
                const res = await createSale({
                    productId: formData.product?.id || 'prod_mock',
                    customerId: formData.customer?.id || 'cust_mock',
                    installments: formData.installments,
                    amountCents: formData.product?.price_cents || 10000
                });

                if (res.error) {
                    setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${res.error}` }]);
                } else {
                    setMessages(prev => [...prev, { role: 'assistant', content: "Sale created successfully! Redirecting..." }]);
                    setTimeout(() => router.push('/app/sales'), 2000);
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Cancelled. Type product name to start over." }]);
                setStep('product');
            }
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] p-4 flex flex-col gap-4 max-w-2xl mx-auto">
            <div className="flex-none">
                <h1 className="text-3xl font-bold tracking-tight">New Sale Wizard</h1>
                <p className="text-muted-foreground">Chat with the bot to register a new sale quickly.</p>
            </div>

            <Card className="flex-1 flex flex-col min-h-0 shadow-lg">
                <CardContent className="flex-1 flex flex-col p-4 gap-4 min-h-0">
                    <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                        <div className="space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-none", m.role === 'assistant' ? "bg-blue-600 text-white" : "bg-muted")}>
                                        {m.role === 'assistant' ? <Bot size={16} /> : <UserIcon size={16} />}
                                    </div>
                                    <div className="space-y-2 max-w-[80%]">
                                        <div className={cn("rounded-lg p-3 text-sm whitespace-pre-wrap", m.role === 'assistant' ? "bg-muted" : "bg-blue-600 text-white")}>
                                            {m.content}
                                        </div>
                                        {m.options && (
                                            <div className="flex flex-wrap gap-2">
                                                {m.options.map(opt => (
                                                    <Button key={opt.value} variant="outline" size="sm" onClick={() => { setInput(opt.value); handleSend(); }}>
                                                        {opt.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="flex gap-2 pt-2 border-t">
                        <Input
                            placeholder="Type your answer..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            autoFocus
                        />
                        <Button onClick={handleSend} size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
