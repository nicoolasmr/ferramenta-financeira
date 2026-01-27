
import { createClient } from "@/lib/supabase/server";
import { BelvoDashboardBlock } from "@/components/dashboard/BelvoDashboardBlock";
import { AddProductDialog } from "@/components/projects/add-product-dialog";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Package, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { getProjectProducts, getProjectBuyers } from "@/actions/projects";

export default async function ProjectDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

    if (!project) notFound();

    const [products, buyers] = await Promise.all([
        getProjectProducts(projectId),
        getProjectBuyers(projectId)
    ]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/app/projects">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-wide">Project Details & Monitoring</p>
                </div>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList>
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="products" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Products ({products.length})
                    </TabsTrigger>
                    <TabsTrigger value="buyers" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Buyers ({buyers.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6">
                    <BelvoDashboardBlock orgId={project.org_id} projectId={project.id} />

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Link href={`/app/projects/${projectId}/cash`} className="text-sm text-blue-600 hover:underline">
                                    Caixa Real
                                </Link>
                                <Link href={`/app/projects/${projectId}/integrations`} className="text-sm text-blue-600 hover:underline">
                                    Integrations
                                </Link>
                                <Link href={`/app/projects/${projectId}/collections`} className="text-sm text-blue-600 hover:underline">
                                    Collections
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="products" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Project Products</CardTitle>
                            <AddProductDialog orgId={project.org_id} projectId={project.id} />
                        </CardHeader>
                        <CardContent>
                            {products.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No products found for this project.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product: any) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell className="capitalize">{product.type}</TableCell>
                                                <TableCell className="text-right">
                                                    {(product.price_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="buyers" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Buyers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {buyers.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No buyers found for this project.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Document</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {buyers.map((buyer: any) => (
                                            <TableRow key={buyer.id}>
                                                <TableCell className="font-medium">{buyer.name}</TableCell>
                                                <TableCell>{buyer.email || 'N/A'}</TableCell>
                                                <TableCell>{buyer.document || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/app/customers/${buyer.id}`}>View Profile</Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
