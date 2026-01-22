"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateDialog } from "@/components/dialogs/CreateDialog";
import { EditDialog } from "@/components/dialogs/EditDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import {
    getOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    moveOpportunityStage,
    type SalesOpportunity,
} from "@/actions/sales";
import { toast } from "sonner";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";

const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function SalesPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeOrganization) return;

        getOpportunities(activeOrganization.id)
            .then(setOpportunities)
            .catch(() => toast.error("Failed to load opportunities"))
            .finally(() => setLoading(false));
    }, [activeOrganization]);

    const handleCreate = async (data: Record<string, string>) => {
        if (!activeOrganization) {
            toast.error("Organização não encontrada");
            return;
        }
        try {
            await createOpportunity({
                name: data.name,
                customer_id: data.customer_id || "cust-1",
                value: parseFloat(data.value),
                stage: data.stage,
                probability: parseInt(data.probability),
                expected_close_date: data.expected_close_date,
                org_id: activeOrganization.id,
            });
            toast.success("Opportunity created!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to create opportunity");
        }
    };

    const handleUpdate = async (id: string, data: Record<string, string>) => {
        try {
            await updateOpportunity(id, {
                name: data.name,
                value: parseFloat(data.value),
                stage: data.stage,
                probability: parseInt(data.probability),
                expected_close_date: data.expected_close_date,
            });
            toast.success("Opportunity updated!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update opportunity");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteOpportunity(id);
            toast.success("Opportunity deleted!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete opportunity");
        }
    };

    const handleMoveStage = async (id: string, newStage: string) => {
        try {
            await moveOpportunityStage(id, newStage);
            toast.success("Stage updated!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to move stage");
        }
    };

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    const opportunitiesByStage = STAGES.reduce((acc, stage) => {
        acc[stage] = opportunities.filter((opp) => opp.stage === stage);
        return acc;
    }, {} as Record<string, SalesOpportunity[]>);

    const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Funnel</h1>
                    <p className="text-slate-500">
                        Total Pipeline: R$ {totalValue.toLocaleString("pt-BR")}
                    </p>
                </div>
                <CreateDialog
                    title="Create Opportunity"
                    description="Add a new sales opportunity"
                    fields={[
                        { name: "name", label: "Opportunity Name", type: "text", required: true },
                        { name: "value", label: "Value (R$)", type: "number", required: true },
                        { name: "probability", label: "Probability (%)", type: "number", required: true },
                        { name: "expected_close_date", label: "Expected Close Date", type: "text", required: true },
                    ]}
                    onSubmit={handleCreate}
                    triggerLabel="Add Opportunity"
                />
            </div>

            {opportunities.length === 0 ? (
                <EmptyState
                    title="No opportunities yet"
                    description="Start by creating your first sales opportunity"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {STAGES.map((stage) => (
                        <div key={stage} className="bg-white rounded-lg border p-4">
                            <h3 className="font-semibold mb-4">{stage}</h3>
                            <div className="space-y-2">
                                {opportunitiesByStage[stage]?.map((opp) => (
                                    <OpportunityCard
                                        key={opp.id}
                                        opportunity={opp}
                                        onUpdate={handleUpdate}
                                        onDelete={handleDelete}
                                        onMoveStage={handleMoveStage}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function OpportunityCard({
    opportunity,
    onUpdate,
    onDelete,
    onMoveStage,
}: {
    opportunity: SalesOpportunity;
    onUpdate: (id: string, data: Record<string, string>) => void;
    onDelete: (id: string) => void;
    onMoveStage: (id: string, newStage: string) => void;
}) {
    return (
        <div className="p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-sm">{opportunity.name}</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() =>
                                onUpdate(opportunity.id, {
                                    name: opportunity.name,
                                    value: String(opportunity.value),
                                    stage: opportunity.stage,
                                    probability: String(opportunity.probability),
                                    expected_close_date: opportunity.expected_close_date,
                                })
                            }
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(opportunity.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <p className="text-sm text-slate-600">R$ {opportunity.value.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-slate-500">{opportunity.probability}% probability</p>
        </div>
    );
}
