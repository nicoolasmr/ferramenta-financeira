"use client";

import { useEffect, useState } from "react";
import { Plus, Eye, EyeOff, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateDialog } from "@/components/dialogs/CreateDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import {
    getAPIKeys,
    createAPIKey,
    revokeAPIKey,
    deleteAPIKey,
    type APIKey,
} from "@/actions/api-keys";
import { toast } from "sonner";

export default function APIKeysPage() {
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        getAPIKeys("org-1")
            .then(setApiKeys)
            .catch(() => toast.error("Failed to load API keys"))
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (data: Record<string, string>) => {
        try {
            const result = await createAPIKey({
                name: data.name,
                org_id: "org-1",
            });
            toast.success("API Key created! Copy it now - it won't be shown again.");
            // Show the key in a dialog or copy to clipboard
            navigator.clipboard.writeText(result.key);
            toast.info("Key copied to clipboard!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to create API key");
        }
    };

    const handleRevoke = async (id: string) => {
        try {
            await revokeAPIKey(id);
            toast.success("API Key revoked!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to revoke API key");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAPIKey(id);
            toast.success("API Key deleted!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete API key");
        }
    };

    const toggleKeyVisibility = (id: string) => {
        setVisibleKeys((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const copyKey = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(id);
        toast.success("Key copied to clipboard!");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const maskKey = (key: string) => {
        return `${key.substring(0, 7)}${"•".repeat(48)}${key.substring(key.length - 4)}`;
    };

    if (loading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
                    <p className="text-slate-500">Manage your API keys for programmatic access</p>
                </div>
                <CreateDialog
                    title="Create API Key"
                    description="Generate a new API key for your application"
                    fields={[
                        { name: "name", label: "Key Name", type: "text", required: true, placeholder: "Production API Key" },
                    ]}
                    onSubmit={handleCreate}
                    triggerLabel="Create API Key"
                />
            </div>

            {apiKeys.length === 0 ? (
                <EmptyState
                    title="No API keys yet"
                    description="Create your first API key to start using the API"
                />
            ) : (
                <div className="grid gap-4">
                    {apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="bg-white rounded-lg border p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold mb-1">{apiKey.name}</h3>
                                    <p className="text-sm text-slate-500">
                                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                                    </p>
                                    {apiKey.last_used_at && (
                                        <p className="text-sm text-slate-500">
                                            Last used {new Date(apiKey.last_used_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${apiKey.status === "active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {apiKey.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <code className="flex-1 px-3 py-2 bg-slate-50 rounded border font-mono text-sm">
                                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => toggleKeyVisibility(apiKey.id)}
                                >
                                    {visibleKeys.has(apiKey.id) ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyKey(apiKey.key, apiKey.id)}
                                >
                                    {copiedKey === apiKey.id ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                {apiKey.status === "active" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRevoke(apiKey.id)}
                                    >
                                        Revoke
                                    </Button>
                                )}
                                <DeleteDialog
                                    title="Delete API Key"
                                    description="Are you sure you want to delete this API key? This action cannot be undone."
                                    itemName={apiKey.name}
                                    onConfirm={() => handleDelete(apiKey.id)}
                                    trigger={
                                        <Button variant="outline" size="sm" className="text-red-600">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
