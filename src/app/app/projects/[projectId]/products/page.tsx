"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import { getProjectProducts } from "@/actions/projects/products-actions"; // Need to create index
// import { CreateProductDialog } from "./create-product-dialog"; // Placeholder

export default function ProjectProductsPage({ params }: { params: { projectId: string } }) {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        getProjectProducts(params.projectId).then(setProducts);
    }, [params.projectId]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Products</h2>
                    <p className="text-sm text-muted-foreground">Manage products and pricing for this project.</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" /> New Product
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.length === 0 ? (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                        No products found. Create one to get started.
                    </div>
                ) : (
                    products.map(p => (
                        <Card key={p.id}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    {p.name}
                                </CardTitle>
                                <CardDescription>{(p.price_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
