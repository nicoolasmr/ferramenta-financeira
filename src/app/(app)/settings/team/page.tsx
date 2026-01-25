'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Trash2, Shield, Loader2, RotateCcw } from 'lucide-react';
import { getActiveOrganization } from '@/actions/organization';
import { getTeamMembers, getPendingInvitations, inviteTeamMember, removeMember, resendInvitation, TeamMember, TeamInvitation } from '@/actions/team';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    owner: { label: 'Proprietário', color: 'bg-purple-100 text-purple-700' },
    admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700' },
    member: { label: 'Membro', color: 'bg-slate-100 text-slate-700' },
};

export default function TeamSettingsPage() {
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'member'>('member');

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [members, setMembers] = useState<any[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [orgId, setOrgId] = useState<string | null>(null);

    async function fetchData() {
        try {
            const org = await getActiveOrganization();
            if (!org) return;
            setOrgId(org.id);

            const [mems, invs] = await Promise.all([
                getTeamMembers(org.id),
                getPendingInvitations(org.id)
            ]);

            // Enrich members with user emails? 
            // The getTeamMembers returns memberships, which should ideally include user details.
            // But currently it selects *. I might need to update the query in the action to join users.
            // Let's assume the action handles it or we fix the action next.
            // Looking at the action: .select("*"). It only returns membership fields.
            // I will update the action to select user:users(email) if needed. 
            // For now, let's presume the UI will just show ID if email missing, or I fix the action immediately after this.

            setMembers(mems);
            setInvitations(invs);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar equipe");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvite = async () => {
        if (!orgId) return;
        setActionLoading(true);
        try {
            await inviteTeamMember({
                email: inviteEmail,
                role: inviteRole,
                org_id: orgId
            });

            toast.success("Convite enviado com sucesso!");
            setInviteOpen(false);
            setInviteEmail('');
            setInviteRole('member');
            fetchData(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar convite");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemove = async (id: string, isInvite: boolean) => {
        if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) return;

        try {
            if (isInvite) {
                // TODO: add deleteInvitation action or reuse removeMember logic?
                // Actually removeMember uses 'memberships' table. Invitations are in 'team_invitations'.
                // I need a cancelInvitation action. For now, let's use removeMember for members only.
                toast.error("Cancelamento de convite ainda não implementado na UI (Backlog).");
            } else {
                await removeMember(id);
                toast.success("Membro removido.");
                fetchData();
            }
        } catch (e) {
            toast.error("Erro ao remover.");
        }
    };

    const handleResend = async (id: string) => {
        try {
            await resendInvitation(id);
            toast.success("Convite reenviado!");
            fetchData();
        } catch (e) {
            toast.error("Erro ao reenviar.");
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8" />
                        Gerenciar Equipe
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Convide membros e gerencie permissões da sua organização.
                    </p>
                </div>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Convidar Membro
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Convidar Novo Membro</DialogTitle>
                            <DialogDescription>
                                Envie um convite por email para adicionar um novo membro à sua organização.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="email@empresa.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">Função</Label>
                                <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="owner">Proprietário (acesso total)</SelectItem>
                                        <SelectItem value="admin">Administrador (gerenciar configurações)</SelectItem>
                                        <SelectItem value="member">Membro (acesso limitado)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setInviteOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleInvite} disabled={actionLoading || !inviteEmail}>
                                {actionLoading ? 'Enviando...' : 'Enviar Convite'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Members */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Membros Ativos</CardTitle>
                    <CardDescription>
                        Pessoas que já aceitaram o convite e têm acesso à organização
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Membro desde</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">
                                        {/* Ideally we fetch user email properly. For now showing ID or joined data */}
                                        {/* I will fix the action to return joined user data immediately after */}
                                        {member.user?.email || "Carregando..."}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={ROLE_LABELS[member.role]?.color || ROLE_LABELS.member.color}>
                                            {ROLE_LABELS[member.role]?.label || member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(member.created_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {member.role !== 'owner' && (
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRemove(member.id, false)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {members.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">Nenhum membro encontrado</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pending Invitations */}
            <Card>
                <CardHeader>
                    <CardTitle>Convites Pendentes</CardTitle>
                    <CardDescription>
                        Convites enviados que ainda não foram aceitos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {invitations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead>Enviado em</TableHead>
                                    <TableHead>Expira em</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            {invitation.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={ROLE_LABELS[invitation.role]?.color || ROLE_LABELS.member.color}>
                                                {ROLE_LABELS[invitation.role]?.label || invitation.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleResend(invitation.id)}>
                                                <RotateCcw className="w-4 h-4" />
                                            </Button>
                                            {/* Delete TODO */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Nenhum convite pendente</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
