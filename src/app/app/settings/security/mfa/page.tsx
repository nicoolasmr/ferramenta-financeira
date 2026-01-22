"use client";

import { Shield, Smartphone, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SecurityMFAPage() {
    const mfaEnabled = false;

    return (
        <div className="flex flex-col gap-6">
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
                <CardContent className="space-y-4">
                    {!mfaEnabled ? (
                        <>
                            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-blue-900 mb-1">
                                        Secure your account
                                    </h3>
                                    <p className="text-sm text-blue-700">
                                        Enable MFA to protect your account from unauthorized access.
                                        You'll need an authenticator app like Google Authenticator or Authy.
                                    </p>
                                </div>
                            </div>
                            <Button>
                                <Smartphone className="w-4 h-4 mr-2" />
                                Enable MFA
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
                                    <Button variant="outline" size="sm">
                                        Reconfigure
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Key className="w-5 h-5 text-slate-600" />
                                        <div>
                                            <p className="font-medium">Backup Codes</p>
                                            <p className="text-sm text-slate-500">8 codes remaining</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        View Codes
                                    </Button>
                                </div>
                            </div>
                            <Button variant="destructive">Disable MFA</Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
