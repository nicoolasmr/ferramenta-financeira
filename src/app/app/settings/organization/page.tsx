"use client";

import { Building2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function OrganizationSettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                <p className="text-slate-500">Manage your organization details</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update your organization's basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input id="name" defaultValue="My Organization" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="legal-name">Legal Name</Label>
                        <Input id="legal-name" placeholder="Legal business name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tax-id">Tax ID (CNPJ)</Label>
                        <Input id="tax-id" placeholder="00.000.000/0000-00" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" placeholder="Full address" />
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Logo</CardTitle>
                    <CardDescription>Upload your organization logo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-slate-400" />
                        </div>
                        <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Logo
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
