'use client';

import { useState } from 'react';
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
import { UserPlus, Mail, Trash2, Shield } from 'lucide-react';

// Mock data
const MOCK_MEMBERS = [
    { id: '1', email: 'owner@empresa.com', role: 'owner', joined_at: '2026-01-15' },
    { id: '2', email: 'admin@empresa.com', role: 'admin', joined_at: '2026-01-16' },
    { id: '3', email: 'dev@empresa.com', role: 'member', joined_at: '2026-01-18' },
];

const MOCK_INVITATIONS = [
    { id: '1', email: 'pending@empresa.com', role: 'member', created_at: '2026-01-20', expires_at: '2026-01-27' },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    owner: { label: 'Proprietário', color: 'bg-purple-100 text-purple-700' },
    admin: { label: 'Administrador', color: 'bg-blue-100 text-blue-700' },
    member: { label: 'Membro', color: 'bg-slate-100 text-slate-700' },
};

export default function TeamSettingsPage() {
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'owner' | 'admin' | 'member'>('member');
    const [loading, setLoading] = useState(false);

    const handleInvite = async () => {
        setLoading(true);
        try {
            // TODO: Implement API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setInviteOpen(false);
            setInviteEmail('');
            setInviteRole('member');
        } catch (error) {
            alert('Erro ao enviar convite');
        } finally {
            setLoading(false);
        }
    };

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
                            <Button onClick={handleInvite} disabled={loading || !inviteEmail}>
                                {loading ? 'Enviando...' : 'Enviar Convite'}
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
                                <TableHead>Email</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead>Membro desde</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_MEMBERS.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.email}</TableCell>
                                    <TableCell>
                                        <Badge className={ROLE_LABELS[member.role].color}>
                                            {ROLE_LABELS[member.role].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {member.role !== 'owner' && (
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
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
                    {MOCK_INVITATIONS.length > 0 ? (
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
                                {MOCK_INVITATIONS.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            {invitation.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={ROLE_LABELS[invitation.role].color}>
                                                {ROLE_LABELS[invitation.role].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
