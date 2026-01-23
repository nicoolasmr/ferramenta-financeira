"use client";

import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/states/LoadingState";
import {
    getOrganization,
    updateOrganization,
    type Organization,
} from "@/actions/organization";
import { toast } from "sonner";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";

export default function OrganizationSettingsPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        legal_name: "",
        tax_id: "",
        address: "",
    });

    useEffect(() => {
        if (orgLoading) return;

        if (!activeOrganization) {
            setLoading(false);
            return;
        }

        getOrganization(activeOrganization.id)
            .then((org) => {
                if (org) {
                    setOrganization(org);
                    setFormData({
                        name: org.name || "",
                        legal_name: org.legal_name || "",
                        tax_id: org.tax_id || "",
                        address: (org.address as string) || "",
                    });
                }
            })
            .catch(() => toast.error("Failed to load organization"))
            .finally(() => setLoading(false));
    }, [activeOrganization, orgLoading]);

    const handleSave = async (e: React.FormEvent) => {
        if (!activeOrganization) return;
        e.preventDefault();
        setSaving(true);
        try {
            await updateOrganization(activeOrganization.id, formData);
            toast.success("Organization settings saved!");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                <p className="text-slate-500">Manage your organization information</p>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-lg border p-6 space-y-6">
                {/* Organization Name */}
                <div className="grid gap-2">
                    <Label htmlFor="name">
                        Organization Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Acme Inc."
                        required
                    />
                </div>

                {/* Legal Name */}
                <div className="grid gap-2">
                    <Label htmlFor="legal_name">Legal Name</Label>
                    <Input
                        id="legal_name"
                        value={formData.legal_name}
                        onChange={(e) => handleChange("legal_name", e.target.value)}
                        placeholder="Acme Incorporated"
                    />
                </div>

                {/* Tax ID */}
                <div className="grid gap-2">
                    <Label htmlFor="tax_id">Tax ID (CNPJ)</Label>
                    <Input
                        id="tax_id"
                        value={formData.tax_id}
                        onChange={(e) => handleChange("tax_id", e.target.value)}
                        placeholder="00.000.000/0000-00"
                    />
                </div>

                {/* Address */}
                <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        placeholder="Street, Number, City, State, ZIP"
                        rows={3}
                    />
                </div>

                {/* Logo Upload */}
                <div className="grid gap-2">
                    <Label htmlFor="logo">Organization Logo</Label>
                    <div className="flex items-center gap-4">
                        {organization?.logo_url && (
                            <img
                                src={organization.logo_url}
                                alt="Organization logo"
                                className="w-16 h-16 rounded-lg border object-cover"
                            />
                        )}
                        <Button type="button" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                        </Button>
                    </div>
                    <p className="text-sm text-slate-500">
                        Recommended size: 200x200px. Max file size: 2MB.
                    </p>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3 pt-4 border-t">
                    <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <p className="text-sm text-slate-500">
                        Last updated: {organization?.updated_at ? new Date(organization.updated_at).toLocaleString() : "Never"}
                    </p>
                </div>
            </form>
        </div>
    );
}
