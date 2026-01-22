"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/states/LoadingState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Upload } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        avatar_url: ""
    });

    useEffect(() => {
        async function loadUser() {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setFormData({
                        full_name: currentUser.user_metadata?.full_name || "",
                        email: currentUser.email || "",
                        avatar_url: currentUser.user_metadata?.avatar_url || ""
                    });
                }
            } catch (error) {
                console.error('Error loading user:', error);
                toast.error('Erro ao carregar perfil');
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // TODO: Implement user profile update
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Erro ao salvar perfil');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="flex flex-col gap-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-slate-500">Manage your personal information and preferences</p>
            </div>

            {/* Profile Picture */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Update your avatar image</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={formData.avatar_url} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {formData.full_name?.[0]?.toUpperCase() || formData.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload New Picture
                        </Button>
                        <p className="text-xs text-slate-500">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="full_name"
                                className="pl-10"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="email"
                                type="email"
                                className="pl-10"
                                value={formData.email}
                                disabled
                                placeholder="your@email.com"
                            />
                        </div>
                        <p className="text-xs text-slate-500">Email cannot be changed. Contact support if needed.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>View your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-slate-500">User ID</span>
                        <span className="text-sm font-mono">{user?.id?.substring(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-sm text-slate-500">Account Created</span>
                        <span className="text-sm">{new Date(user?.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-sm text-slate-500">Last Sign In</span>
                        <span className="text-sm">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
