"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TeamInvitation {
    id: string;
    email: string;
    role: "owner" | "admin" | "member";
    status: "pending" | "accepted" | "expired";
    org_id: string;
    invited_by: string;
    created_at: string;
    expires_at: string;
}

export interface TeamMember {
    id: string;
    user_id: string;
    org_id: string;
    role: "owner" | "admin" | "member";
    status: "active" | "inactive";
    created_at: string;
}

export async function getTeamMembers(orgId: string): Promise<TeamMember[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("memberships")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getPendingInvitations(orgId: string): Promise<TeamInvitation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("org_id", orgId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function inviteTeamMember(formData: {
    email: string;
    role: "owner" | "admin" | "member";
    org_id: string;
    invited_by: string;
}) {
    const supabase = await createClient();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase.from("team_invitations").insert({
        ...formData,
        status: "pending",
        expires_at: expiresAt.toISOString(),
    });

    if (error) throw error;
    revalidatePath("/app/settings/team");

    // TODO: Send invitation email
}

export async function updateMemberRole(memberId: string, role: "owner" | "admin" | "member") {
    const supabase = await createClient();
    const { error } = await supabase
        .from("memberships")
        .update({ role })
        .eq("id", memberId);

    if (error) throw error;
    revalidatePath("/app/settings/team");
}

export async function removeMember(memberId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("memberships")
        .delete()
        .eq("id", memberId);

    if (error) throw error;
    revalidatePath("/app/settings/team");
}

export async function resendInvitation(invitationId: string) {
    const supabase = await createClient();

    // Update expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase
        .from("team_invitations")
        .update({ expires_at: expiresAt.toISOString() })
        .eq("id", invitationId);

    if (error) throw error;
    revalidatePath("/app/settings/team");

    // TODO: Resend invitation email
}

export async function acceptInvitation(token: string) {
    const supabase = await createClient();

    // 1. Find the invitation
    const { data: invitation, error: invError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("id", token) // Using ID as token for simplicity in this MVP
        .eq("status", "pending")
        .single();

    if (invError || !invitation) {
        throw new Error("Invalid or expired invitation");
    }

    // 2. Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
        await supabase
            .from("team_invitations")
            .update({ status: "expired" })
            .eq("id", token);
        throw new Error("Invitation has expired");
    }

    // 3. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // 4. Create membership
    const { error: memError } = await supabase.from("memberships").insert({
        org_id: invitation.org_id,
        user_id: user.id,
        role: invitation.role,
        status: "active",
    });

    if (memError) throw memError;

    // 5. Mark invitation as accepted
    await supabase
        .from("team_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", token);

    revalidatePath("/app/settings/team");
    return { success: true };
}
