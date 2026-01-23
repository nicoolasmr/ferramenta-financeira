"use client";

import { useEffect, useState } from "react";
import { Plus, MoreHorizontal, UserPlus, UserMinus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateDialog } from "@/components/dialogs/CreateDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { LoadingState } from "@/components/states/LoadingState";
import {
    getTeamMembers,
    getPendingInvitations,
    inviteTeamMember,
    updateMemberRole,
    removeMember,
    resendInvitation,
    type TeamMember,
    type TeamInvitation,
} from "@/actions/team";
import { toast } from "sonner";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";

const ROLE_COLORS = {
    owner: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
    member: "bg-slate-100 text-slate-700",
};

export default function TeamPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orgLoading) return;

        if (!activeOrganization) {
            setLoading(false);
            return;
        }

        Promise.all([
            getTeamMembers(activeOrganization.id),
            getPendingInvitations(activeOrganization.id),
        ])
            .then(([membersData, invitationsData]) => {
                setMembers(membersData);
                setInvitations(invitationsData);
            })
            .catch(() => toast.error("Failed to load team data"))
            .finally(() => setLoading(false));
    }, [activeOrganization, orgLoading]);

    const handleInvite = async (data: Record<string, string>) => {
        if (!activeOrganization) return;
        try {
            await inviteTeamMember({
                email: data.email,
                role: data.role as "owner" | "admin" | "member",
                org_id: activeOrganization.id,
                invited_by: "current-user-id", // TODO: Get from auth
            });
            toast.success("Invitation sent!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to send invitation");
        }
    };

    const handleChangeRole = async (memberId: string, role: "owner" | "admin" | "member") => {
        try {
            await updateMemberRole(memberId, role);
            toast.success("Role updated!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const handleRemove = async (memberId: string) => {
        try {
            await removeMember(memberId);
            toast.success("Member removed!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to remove member");
        }
    };

    const handleResend = async (invitationId: string) => {
        try {
            await resendInvitation(invitationId);
            toast.success("Invitation resent!");
        } catch (error) {
            toast.error("Failed to resend invitation");
        }
    };

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
                    <p className="text-slate-500">Manage your team members and invitations</p>
                </div>
                <CreateDialog
                    title="Invite Team Member"
                    description="Send an invitation to join your organization"
                    fields={[
                        { name: "email", label: "Email Address", type: "email", required: true },
                        { name: "role", label: "Role (owner/admin/member)", type: "text", required: true },
                    ]}
                    onSubmit={handleInvite}
                    triggerLabel="Invite Member"
                />
            </div>

            {/* Active Members */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Team Members ({members.length})</h2>
                <div className="grid gap-4">
                    {members.map((member) => (
                        <div key={member.id} className="bg-white rounded-lg border p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                        {member.user_id.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">User {member.user_id}</h3>
                                        <p className="text-sm text-slate-500">
                                            Joined {new Date(member.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[member.role]}`}>
                                        {member.role}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, "admin")}>
                                                <Shield className="h-4 w-4 mr-2" />
                                                Make Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleChangeRole(member.id, "member")}>
                                                <Shield className="h-4 w-4 mr-2" />
                                                Make Member
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleRemove(member.id)}
                                                className="text-red-600"
                                            >
                                                <UserMinus className="h-4 w-4 mr-2" />
                                                Remove
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Pending Invitations ({invitations.length})</h2>
                    <div className="grid gap-4">
                        {invitations.map((invitation) => (
                            <div key={invitation.id} className="bg-slate-50 rounded-lg border border-dashed p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{invitation.email}</h3>
                                        <p className="text-sm text-slate-500">
                                            Invited {new Date(invitation.created_at).toLocaleDateString()} •
                                            Expires {new Date(invitation.expires_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[invitation.role]}`}>
                                            {invitation.role}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleResend(invitation.id)}
                                        >
                                            Resend
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
