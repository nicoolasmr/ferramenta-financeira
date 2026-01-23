"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, TestTube } from "lucide-react";
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
    getWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    type Webhook,
} from "@/actions/webhooks";
import { toast } from "sonner";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebhookLogs } from "@/components/webhooks/webhook-logs";

export default function WebhooksPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!activeOrganization) return;

        getWebhooks(activeOrganization.id)
            .then(setWebhooks)
            .catch(() => toast.error("Failed to load webhooks"))
            .finally(() => setLoading(false));
    }, [activeOrganization]);

    const handleCreate = async (data: Record<string, string>) => {
        if (!activeOrganization) {
            toast.error("Organização não encontrada");
            return;
        }
        try {
            await createWebhook({
                url: data.url,
                events: data.events.split(",").map((e) => e.trim()),
                org_id: activeOrganization.id,
            });
            toast.success("Webhook created!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to create webhook");
        }
    };

    const handleUpdate = async (id: string, data: Record<string, string>) => {
        try {
            await updateWebhook(id, {
                url: data.url,
                events: data.events.split(",").map((e) => e.trim()),
            });
            toast.success("Webhook updated!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update webhook");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteWebhook(id);
            toast.success("Webhook deleted!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete webhook");
        }
    };

    const handleTest = async (id: string) => {
        try {
            const result = await testWebhook(id);
            if (result.success) {
                toast.success("Webhook test successful!");
            } else {
                toast.error(`Webhook test failed: ${result.error || result.status}`);
            }
        } catch (error) {
            toast.error("Failed to test webhook");
        }
    };

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
                <p className="text-slate-500">Manage webhook endpoints and monitor delivery logs</p>
            </div>

            <Tabs defaultValue="endpoints" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                    <TabsTrigger value="logs">Inbox & Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="endpoints">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-end">
                            <CreateDialog
                                title="Create Webhook"
                                description="Add a new webhook endpoint"
                                fields={[
                                    { name: "url", label: "Endpoint URL", type: "text", required: true },
                                    {
                                        name: "events",
                                        label: "Events (comma-separated)",
                                        type: "text",
                                        required: true,
                                        placeholder: "payment.created, payment.updated",
                                    },
                                ]}
                                onSubmit={handleCreate}
                                triggerLabel="Add Webhook"
                            />
                        </div>

                        {webhooks.length === 0 ? (
                            <EmptyState
                                title="No webhooks configured"
                                description="Start by adding your first webhook endpoint"
                            />
                        ) : (
                            <div className="grid gap-4">
                                {webhooks.map((webhook) => (
                                    <div key={webhook.id} className="bg-white rounded-lg border p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold">{webhook.url}</h3>
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${webhook.status === "active"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-slate-100 text-slate-700"
                                                            }`}
                                                    >
                                                        {webhook.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    Events: {webhook.events.join(", ")}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span>Success Rate: {webhook.success_rate}%</span>
                                                    {webhook.last_delivery_at && (
                                                        <span>
                                                            Last Delivery: {new Date(webhook.last_delivery_at).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleTest(webhook.id)}
                                                >
                                                    <TestTube className="h-4 w-4 mr-2" />
                                                    Test
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleUpdate(webhook.id, {
                                                                    url: webhook.url,
                                                                    events: webhook.events.join(", "),
                                                                })
                                                            }
                                                        >
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(webhook.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="logs">
                    <WebhookLogs orgId={activeOrganization.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
