"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, ExternalLink, Info } from "lucide-react";
import { generateWebhookUrl, WEBHOOK_INSTRUCTIONS, type WebhookProvider } from "@/actions/integrations/webhook-config";
import { TestConnectionButton } from "./test-connection-button";
import { toast } from "sonner";

interface WebhookWizardProps {
    provider: WebhookProvider;
    orgId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete?: () => void;
}

export function WebhookWizard({ provider, orgId, open, onOpenChange, onComplete }: WebhookWizardProps) {
    const [copied, setCopied] = useState(false);
    const [credentials, setCredentials] = useState<Record<string, string>>({});

    const webhookUrl = generateWebhookUrl(provider, orgId);
    const instructions = WEBHOOK_INSTRUCTIONS[provider];

    const handleCopy = async () => {
        await navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        toast.success('Webhook URL copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const getCredentialFields = () => {
        switch (provider) {
            case 'stripe':
                return [{ key: 'api_key', label: 'Secret Key', type: 'password', placeholder: 'sk_...' }];
            case 'hotmart':
                return [
                    { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'Your Client ID' },
                    { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Your Client Secret' }
                ];
            case 'asaas':
                return [{ key: 'webhook_token', label: 'Access Token ($aact_...)', type: 'password', placeholder: '$aact_...' }];
            case 'mercadopago':
                return [{ key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' }];
            case 'kiwify':
                return [{ key: 'webhook_token', label: 'Webhook Token (Signature)', type: 'password', placeholder: 'Compare against this secret' }];
            case 'eduzz':
                return [{ key: 'api_key', label: 'API Key', type: 'password', placeholder: '...' }];
            case 'belvo':
                return [
                    { key: 'secret_id', label: 'Secret ID', type: 'password', placeholder: '...' },
                    { key: 'secret_password', label: 'Secret Password', type: 'password', placeholder: '...' }
                ];
            default:
                return [{ key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your API Key' }];
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{instructions.title}</DialogTitle>
                    <DialogDescription>{instructions.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Step 1: Credentials */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Step 1: Enter Credentials</CardTitle>
                            <CardDescription>Provide your API credentials to connect</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {getCredentialFields().map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label htmlFor={field.key}>{field.label}</Label>
                                    <Input
                                        id={field.key}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={credentials[field.key] || ''}
                                        onChange={(e) => setCredentials({ ...credentials, [field.key]: e.target.value })}
                                    />
                                </div>
                            ))}

                            <TestConnectionButton
                                provider={provider}
                                credentials={credentials}
                                onTestComplete={(result) => {
                                    if (result.success) {
                                        toast.success('Connection successful!');
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Step 2: Webhook URL */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Step 2: Configure Webhook</CardTitle>
                            <CardDescription>Copy this URL and add it to your {provider} dashboard</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Webhook URL</Label>
                                <div className="flex gap-2">
                                    <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                                    <Button variant="outline" size="icon" onClick={handleCopy}>
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    <p className="font-medium mb-2">Follow these steps in your {provider} dashboard:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-sm">
                                        {instructions.steps.map((step, idx) => (
                                            <li key={idx}>{step}</li>
                                        ))}
                                    </ol>
                                </AlertDescription>
                            </Alert>

                            {instructions.docsUrl && (
                                <Button variant="link" className="p-0 h-auto" asChild>
                                    <a href={instructions.docsUrl} target="_blank" rel="noopener noreferrer">
                                        View {provider} documentation
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            onComplete?.();
                            onOpenChange(false);
                            toast.success('Integration configured!');
                        }}>
                            Complete Setup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
