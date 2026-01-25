"use client";

import { useEffect, useState } from "react";
import { Shield, Smartphone, Key, ArrowRight, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingState } from "@/components/states/LoadingState";
import {
    getMFAStatus,
    setupMFA,
    activateMFA,
    disableMFA,
} from "@/actions/mfa";

export default function SecurityPage() {
    const [loading, setLoading] = useState(true);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [step, setStep] = useState<"overview" | "setup" | "verification" | "success">("overview");
    const [qrCode, setQrCode] = useState("");
    const [otpToken, setOtpToken] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        getMFAStatus()
            .then((res) => setMfaEnabled(res.enabled))
            .catch(() => toast.error("Failed to load MFA status"))
            .finally(() => setLoading(false));
    }, []);

    const handleStartSetup = async () => {
        setIsProcessing(true);
        try {
            const res = await setupMFA();
            setQrCode(res.qrCodeUrl);
            setStep("setup");
        } catch (error) {
            toast.error("Failed to start MFA setup");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerify = async () => {
        if (otpToken.length !== 6) {
            toast.error("Please enter a 6-digit code");
            return;
        }
        setIsProcessing(true);
        try {
            const res = await activateMFA(otpToken);
            setBackupCodes(res.backupCodes);
            setMfaEnabled(true);
            setStep("success");
            toast.success("MFA activated successfully!");
        } catch (error) {
            toast.error("Invalid verification code");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm("Are you sure you want to disable MFA? This will make your account less secure.")) return;
        setIsProcessing(true);
        try {
            await disableMFA();
            setMfaEnabled(false);
            setStep("overview");
            toast.success("MFA disabled");
        } catch (error) {
            toast.error("Failed to disable MFA");
        } finally {
            setIsProcessing(false);
        }
    };

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join("\n"));
        toast.success("Backup codes copied to clipboard");
    };

    if (loading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security & MFA</h1>
                <p className="text-slate-500">Protect your account with two-factor authentication</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Two-Factor Authentication</CardTitle>
                            <CardDescription>
                                Add an extra layer of security to your account
                            </CardDescription>
                        </div>
                        {mfaEnabled ? (
                            <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        ) : (
                            <Badge variant="secondary">Disabled</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === "overview" && (
                        <div className="space-y-4">
                            {!mfaEnabled ? (
                                <>
                                    <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                Secure your account
                                            </h3>
                                            <p className="text-sm text-blue-700 dark:text-blue-200/80">
                                                Enable MFA to protect your account from unauthorized access.
                                                You'll need an authenticator app like Google Authenticator or Authy.
                                            </p>
                                        </div>
                                    </div>
                                    <Button onClick={handleStartSetup} disabled={isProcessing}>
                                        <Smartphone className="w-4 h-4 mr-2" />
                                        {isProcessing ? "Starting..." : "Enable MFA"}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Smartphone className="w-5 h-5 text-slate-600" />
                                                <div>
                                                    <p className="font-medium">Authenticator App</p>
                                                    <p className="text-sm text-slate-500">Configured</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={handleStartSetup}>
                                                Reconfigure
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Key className="w-5 h-5 text-slate-600" />
                                                <div>
                                                    <p className="font-medium">Backup Codes</p>
                                                    <p className="text-sm text-slate-500">Generate new ones</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                View Codes
                                            </Button>
                                        </div>
                                    </div>
                                    <Button variant="destructive" onClick={handleDisable} disabled={isProcessing}>
                                        {isProcessing ? "Disabling..." : "Disable MFA"}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {step === "setup" && (
                        <div className="space-y-6 text-center">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Scan QR Code</h3>
                                <p className="text-sm text-slate-500">
                                    Open your authenticator app and scan the code below.
                                </p>
                            </div>
                            <div className="flex justify-center p-4 bg-white rounded-lg border inline-block mx-auto">
                                <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                            </div>
                            <div className="pt-4 flex justify-between">
                                <Button variant="outline" onClick={() => setStep("overview")}>
                                    Cancel
                                </Button>
                                <Button onClick={() => setStep("verification")}>
                                    Next <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === "verification" && (
                        <div className="space-y-6 max-w-xs mx-auto text-center">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Verify Code</h3>
                                <p className="text-sm text-slate-500">
                                    Enter the 6-digit code from your app.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    maxLength={6}
                                    value={otpToken}
                                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                                    placeholder="000 000"
                                    className="text-center text-2xl tracking-[0.5em] font-mono"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setStep("setup")}>
                                        Back
                                    </Button>
                                    <Button className="flex-1" onClick={handleVerify} disabled={isProcessing}>
                                        {isProcessing ? "Verifying..." : "Verify"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="space-y-6 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <Check className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-xl">MFA Enabled!</h3>
                                <p className="text-sm text-slate-500">
                                    Store these backup codes in a safe place. They are the ONLY way to access your account if you lose your phone.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-lg font-mono text-sm border">
                                {backupCodes.map((code, idx) => (
                                    <div key={idx} className="text-slate-600 uppercase">{code}</div>
                                ))}
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button variant="outline" className="flex-1" onClick={copyBackupCodes}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Codes
                                </Button>
                                <Button className="flex-1" onClick={() => setStep("overview")}>
                                    Finish
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
