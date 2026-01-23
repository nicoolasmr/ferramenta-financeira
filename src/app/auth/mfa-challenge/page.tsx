"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { verifyLoginMFA, verifyBackupCode } from "@/actions/mfa/auth";
import { ShieldCheck, KeyRound, Loader2, Lock } from "lucide-react";

export default function MfaChallengePage() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [isBackup, setIsBackup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = isBackup
                ? await verifyBackupCode(code)
                : await verifyLoginMFA(code);

            if (res.error) {
                toast.error(res.error);
                setIsLoading(false);
                return;
            }

            toast.success("Identity verified");
            router.push("/app/dashboard");
            router.refresh();
        } catch (error) {
            toast.error("Verification failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-sm shadow-xl border-slate-200">
                <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        {isBackup
                            ? "Enter one of your recovery codes."
                            : "Enter the 6-digit code from your authenticator app."
                        }
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code" className="sr-only">Code</Label>
                            <Input
                                id="code"
                                type={isBackup ? "text" : "text"}
                                inputMode={isBackup ? "text" : "numeric"}
                                pattern={isBackup ? undefined : "[0-9]*"}
                                autoComplete="one-time-code"
                                placeholder={isBackup ? "recovery-code-123" : "000 000"}
                                className="text-center text-lg tracking-widest h-12"
                                value={code}
                                onChange={(e) => setCode(isBackup ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 6))}
                                autoFocus
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-2">
                        <Button className="w-full" type="submit" disabled={isLoading || code.length < 3}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify
                        </Button>

                        <Button
                            variant="link"
                            type="button"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => {
                                setIsBackup(!isBackup);
                                setCode("");
                            }}
                        >
                            {isBackup ? (
                                <>
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Use Authenticator App
                                </>
                            ) : (
                                <>
                                    <KeyRound className="w-3 h-3 mr-1" />
                                    Use Backup Code
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
