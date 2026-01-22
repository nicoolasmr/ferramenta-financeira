"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TestTube, CheckCircle2, XCircle } from "lucide-react";
import { testConnection } from "@/actions/integrations/test-connection";
import type { TestResult } from "@/lib/integrations/types";

interface TestConnectionButtonProps {
    provider: string;
    credentials: Record<string, string>;
    onTestComplete?: (result: TestResult) => void;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
}

export function TestConnectionButton({
    provider,
    credentials,
    onTestComplete,
    variant = "outline",
    size = "default"
}: TestConnectionButtonProps) {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);

    const handleTest = async () => {
        setTesting(true);
        setResult(null);

        try {
            const testResult = await testConnection(provider, credentials);
            setResult(testResult);
            onTestComplete?.(testResult);
        } catch (error) {
            setResult({
                success: false,
                message: 'Failed to test connection',
                error: 'UNEXPECTED_ERROR'
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="space-y-3">
            <Button
                variant={variant}
                size={size}
                onClick={handleTest}
                disabled={testing || Object.keys(credentials).length === 0}
            >
                {testing ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                    </>
                ) : (
                    <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                    </>
                )}
            </Button>

            {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                    {result.success ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                        <p className="font-medium">{result.message}</p>
                        {result.details && (
                            <pre className="mt-2 text-xs bg-slate-100 p-2 rounded">
                                {JSON.stringify(result.details, null, 2)}
                            </pre>
                        )}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
