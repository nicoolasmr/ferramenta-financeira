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
    const { data: memberships, error: memError } = await supabase
        .from("memberships")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });

    if (memError) {
        console.error("Error fetching memberships:", memError);
        throw new Error("Failed to fetch team members");
    }

    if (!memberships || memberships.length === 0) return [];

    const userIds = memberships.map(m => m.user_id);
    const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, email, full_name, avatar_url")
        .in("id", userIds);

    if (userError) {
        console.error("Error fetching users for team:", userError);
        // Don't throw here, just return members with default user data
    }

    return memberships.map(member => {
        const user = (users || []).find(u => u.id === member.user_id);
        return {
            ...member,
            user: user || { email: 'Unknown', full_name: 'Unknown User', avatar_url: null }
        };
    }) as any;
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
}) {
    const supabase = await createClient();

    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 2. Insert invitation
    // Schema uses 'token' (default generated), 'created_by' (references auth.users), 'org_id'.
    // We rely on default token generation by DB or generate one?
    // DB default: encode(gen_random_bytes(32), 'hex').
    // We should let DB generate it OR select it back to send email.

    // We match schema cols: org_id, email, role, created_by, expires_at.
    const { data, error } = await supabase.from("team_invitations").insert({
        org_id: formData.org_id,
        email: formData.email,
        role: formData.role,
        created_by: user.id, // Securely set from auth
        expires_at: expiresAt.toISOString(),
    }).select().single();

    // ... (existing code)

    // Fetch details for email
    const { data: org } = await supabase.from("organizations").select("name").eq("id", formData.org_id).single();
    const inviterName = user.user_metadata?.full_name || user.email || "Um administrador";
    const orgName = org?.name || "RevenueOS";

    if (error) {
        // Handle unique violation or other errors
        if (error.code === '23505') throw new Error("Invitation already exists for this email");
        throw error;
    }

    revalidatePath("/app/settings/team");

    // Send invitation email
    const { sendInviteEmail } = await import("@/lib/email");
    // data.token is not selected by default in .insert().select().single() unless specified or * is used? 
    // .select() implies * so we have token.
    await sendInviteEmail(data.email, data.token, orgName, inviterName);
}

export async function updateMemberRole(memberId: string, role: "owner" | "admin" | "member") {
    // ...
}

export async function removeMember(memberId: string) {
    // ...
}

export async function resendInvitation(invitationId: string) {
    const supabase = await createClient();

    // Update expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
        .from("team_invitations")
        .update({ expires_at: expiresAt.toISOString() })
        .eq("id", invitationId)
        .select(`
            *,
            organization:organizations(name),
            inviter:created_by(raw_user_meta_data)
        `)
        .single();

    if (error) throw error;
    revalidatePath("/app/settings/team");

    // Resend invitation email
    if (data) {
        const { sendInviteEmail } = await import("@/lib/email");
        // @ts-ignore
        const orgName = data.organization?.name || "RevenueOS";
        // @ts-ignore
        const inviterMeta = data.inviter?.raw_user_meta_data;
        const inviterName = inviterMeta?.full_name || "Um administrador";

        await sendInviteEmail(data.email, data.token, orgName, inviterName);
    }
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
    // 4. Create membership (Use Admin Client to bypass RLS as user is not yet a member)
    const { getAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = getAdminClient();

    if (!adminClient) {
        throw new Error("System configuration error: Missing Service Role Key");
    }

    const { error: memError } = await adminClient.from("memberships").insert({
        org_id: invitation.org_id,
        user_id: user.id,
        role: invitation.role,
        status: "active",
    });

    if (memError) throw memError;

    // 5. Mark invitation as accepted (Admin)
    await adminClient
        .from("team_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", token);

    revalidatePath("/app/settings/team");
    return { success: true };
}
