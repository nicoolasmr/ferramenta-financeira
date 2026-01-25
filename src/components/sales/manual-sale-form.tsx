"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createManualSale } from "@/actions/sales";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ManualSaleForm({ orgId, projects }: { orgId: string, projects: any[] }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        setLoading(true);
        formData.append("orgId", orgId);

        try {
            const result = await createManualSale(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Venda registrada com sucesso!");
                router.push(`/app/sales?org=${orgId}`); // Or receivables?
                router.refresh();
            }
        } catch (e) {
            toast.error("Erro inesperado.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={onSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="customerName">Nome do Cliente</Label>
                    <Input id="customerName" name="customerName" required placeholder="Fulano Silva" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email do Cliente</Label>
                    <Input id="customerEmail" name="customerEmail" type="email" placeholder="fulano@exemplo.com" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="projectId">Projeto</Label>
                <Select name="projectId" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o projeto..." />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="amount">Valor Total (R$)</Label>
                    <Input id="amount" name="amount" required placeholder="12000,00" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="installments">Número de Parcelas</Label>
                    <Input id="installments" name="installments" type="number" min="1" max="24" defaultValue="1" required />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="method">Forma de Pagamento</Label>
                <Select name="method" required defaultValue="credit_card">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="pix">Pix</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar Venda
                </Button>
            </div>
        </form>
    );
}
