"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProduct } from "@/actions/projects";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

interface AddProductDialogProps {
    orgId: string;
    projectId?: string; // Optional if we want to link it immediately, but products table has link? 
    // Wait, products table in schema: org_id, name, description, type, price_cents.
    // It does NOT have project_id. 
    // Wait, getProjectProducts fetches products via ORDERS -> ORDER_ITEMS -> PRODUCTS.
    // So products are independent of projects in the schema, they are linked via sales.
    // BUT the user wants to "Cadastrar um novo produto" in the project tab.
    // If I create a product here, it won't be linked to the project automatically unless I add a project_id to products or link it somehow.
    // Let's check schema again.
    // products table: id, org_id, name, description, type, price_cents, active.
    // orders table: org_id, project_id, ...

    // If the user wants to see "Project Products", and products are only linked via orders, then a new product won't show up until sold?
    // OR maybe the user implies products SHOULD belong to projects?
    // The user said "Preciso poder cadastrar um novo produto... Essa aba também nào funciona...".
    // If I look at the schema, products are org-level.
    // If I add a product, it exists in the org.
    // To show it in "Project Products", maybe we should add a `project_id` to the products table?
    // Let's check if I missed it.
    // Schema line 33: CREATE TABLE IF NOT EXISTS products ( ... org_id UUID ... ) NO project_id.

    // DECISION: I should probably add `project_id` to `products` to allow explicitly associating a product with a project.
    // OR I just create it and it doesn't show up in the list until sold? That seems confusing.
    // The user expects to see it in the tab.
    // I will add `project_id` to the products table in a migration.
}

export function AddProductDialog({ orgId, projectId }: { orgId: string, projectId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        try {
            const name = formData.get("name") as string;
            const type = formData.get("type") as string;
            const priceStr = formData.get("price") as string;
            const description = formData.get("description") as string;

            const priceCents = Math.round(parseFloat(priceStr.replace("R$", "").replace(/\./g, "").replace(",", ".")) * 100);

            await createProduct({
                org_id: orgId,
                name,
                type,
                price_cents: priceCents,
                description,
                // We'll pass project_id if I update the action/schema
            });

            toast.success("Produto criado com sucesso!");
            setOpen(false);
        } catch (error) {
            toast.error("Erro ao criar produto");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Produto
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Produto</DialogTitle>
                    <DialogDescription>
                        Cadastre um novo produto para este projeto.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Produto</Label>
                        <Input id="name" name="name" required placeholder="Ex: Mentoria Individual" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo</Label>
                            <Select name="type" defaultValue="service">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="service">Serviço</SelectItem>
                                    <SelectItem value="standard">Produto Padrão</SelectItem>
                                    <SelectItem value="subscription">Assinatura</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço (R$)</Label>
                            <Input id="price" name="price" required placeholder="0,00" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea id="description" name="description" placeholder="Detalhes do produto..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Produto
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
