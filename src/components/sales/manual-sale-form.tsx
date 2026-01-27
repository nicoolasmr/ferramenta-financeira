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
import CurrencyInput from 'react-currency-input-field';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { manualSaleSchema, type ManualSaleSchema } from "./manual-sale-schema";

export function ManualSaleForm({ orgId, projects }: { orgId: string, projects: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
        resolver: zodResolver(manualSaleSchema),
        defaultValues: {
            installments: 1,
            method: "credit_card",
            situation: "Ativa"
        }
    });

    async function onSubmit(data: ManualSaleSchema) {
        setLoading(true);
        const formData = new FormData();

        // Append all data fields to FormData logic compatible with existing server action
        formData.append("orgId", orgId);
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        try {
            const result = await createManualSale(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Venda registrada com sucesso!");
                reset(); // Reset form on success
                router.refresh(); // Refresh data
            }
        } catch (e) {
            toast.error("Erro inesperado.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Details */}
            <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Dados do Cliente</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="customerName">Nome do Cliente</Label>
                        <Input id="customerName" {...register("customerName")} placeholder="Fulano Silva" />
                        {errors.customerName && <p className="text-red-500 text-xs">{errors.customerName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email do Cliente</Label>
                        <Input id="customerEmail" type="email" {...register("customerEmail")} placeholder="fulano@exemplo.com" />
                        {errors.customerEmail && <p className="text-red-500 text-xs">{errors.customerEmail.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <Input id="phone" {...register("phone")} placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="niche">Nicho</Label>
                        <Input id="niche" {...register("niche")} placeholder="Ex: Endócrino" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Input id="status" {...register("status")} placeholder="Ex: Onboarding" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" {...register("address")} placeholder="Endereço completo" />
                    </div>
                </div>
            </div>

            {/* Cycle & Folder Details */}
            <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Ciclo e Acompanhamento</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="cycleStart">Início do Ciclo</Label>
                        <Input id="cycleStart" type="date" {...register("cycleStart")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cycleEnd">Final do Ciclo</Label>
                        <Input id="cycleEnd" type="date" {...register("cycleEnd")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cycleDuration">Duração do Ciclo</Label>
                        <Input id="cycleDuration" {...register("cycleDuration")} placeholder="Ex: 6 Meses" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="situation">Situação</Label>
                        <Controller
                            control={control}
                            name="situation"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ativa">Ativa</SelectItem>
                                        <SelectItem value="Pausada">Pausada</SelectItem>
                                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="initialDiagnosis">Diagnóstico Inicial</Label>
                        <Input id="initialDiagnosis" {...register("initialDiagnosis")} placeholder="Link ou texto" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mentoredFolder">Pasta Mentorada</Label>
                        <Input id="mentoredFolder" {...register("mentoredFolder")} placeholder="Link da pasta" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meeting1">Encontro 1</Label>
                        <Input id="meeting1" {...register("meeting1")} placeholder="Data ou Link" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contractSigned">Contrato Assinado</Label>
                        <Input id="contractSigned" {...register("contractSigned")} placeholder="Status ou Link" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="followup">Follow-up</Label>
                        <Input id="followup" {...register("followup")} placeholder="Notas de acompanhamento" />
                    </div>
                </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-4 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Financeiro da Venda</h3>
                <div className="space-y-2">
                    <Label htmlFor="projectId">Projeto</Label>
                    <Controller
                        control={control}
                        name="projectId"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o projeto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.projectId && <p className="text-red-500 text-xs">{errors.projectId.message}</p>}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor Total (R$)</Label>
                        <Controller
                            control={control}
                            name="amount"
                            render={({ field }) => (
                                <CurrencyInput
                                    id="amount"
                                    name={field.name}
                                    placeholder="R$ 0,00"
                                    defaultValue={field.value}
                                    decimalsLimit={2}
                                    onValueChange={(value) => field.onChange(value)}
                                    prefix="R$ "
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            )}
                        />
                        {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="installments">Número de Parcelas</Label>
                        <Input id="installments" type="number" {...register("installments")} min="1" max="24" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="method">Forma de Pagamento</Label>
                    <Controller
                        control={control}
                        name="method"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                                    <SelectItem value="boleto">Boleto</SelectItem>
                                    <SelectItem value="pix">Pix</SelectItem>
                                    <SelectItem value="transfer">Transferência</SelectItem>
                                    <SelectItem value="other">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="paymentDetails">Detalhes do Pagamento</Label>
                    <Input id="paymentDetails" {...register("paymentDetails")} placeholder="Ex: Entrada 5k pix + 10k em 5x" />
                </div>
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
