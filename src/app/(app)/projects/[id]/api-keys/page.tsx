'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

// Mock data
const MOCK_API_KEYS = [
    {
        id: '1',
        name: 'Production API Key',
        key_prefix: 'sk_live_',
        key_hint: 'a1b2',
        created_at: '2026-01-15',
        last_used_at: '2026-01-21',
    },
    {
        id: '2',
        name: 'Staging API Key',
        key_prefix: 'sk_test_',
        key_hint: 'c3d4',
        created_at: '2026-01-18',
        last_used_at: null,
    },
];

export default function ApiKeysPage({ params }: { params: { id: string } }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [keyName, setKeyName] = useState('');
    const [keyType, setKeyType] = useState<'secret' | 'publishable'>('secret');
    const [loading, setLoading] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const handleGenerateKey = async () => {
        setLoading(true);
        try {
            // TODO: Implement API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockKey = `${keyType === 'secret' ? 'sk_live_' : 'pk_live_'}${'x'.repeat(32)}`;
            setGeneratedKey(mockKey);
        } catch (error) {
            alert('Erro ao gerar chave');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        alert('Chave copiada!');
    };

    const handleClose = () => {
        setCreateOpen(false);
        setGeneratedKey(null);
        setKeyName('');
        setKeyType('secret');
    };

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Key className="w-8 h-8" />
                        Chaves de API
                    </h1>
                    <p className="text-slate-600 mt-2">
                        Gerencie as chaves de API para integração com o RevenueOS.
                    </p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Gerar Nova Chave
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Gerar Nova Chave de API</DialogTitle>
                            <DialogDescription>
                                {!generatedKey
                                    ? 'Crie uma nova chave para integrar sua aplicação com o RevenueOS.'
                                    : 'Copie e salve esta chave agora. Ela não será exibida novamente.'}
                            </DialogDescription>
                        </DialogHeader>

                        {!generatedKey ? (
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="keyName">Nome da Chave</Label>
                                    <Input
                                        id="keyName"
                                        value={keyName}
                                        onChange={(e) => setKeyName(e.target.value)}
                                        placeholder="Ex: Production Backend Key"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="keyType">Tipo de Chave</Label>
                                    <Select value={keyType} onValueChange={(value: any) => setKeyType(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="secret">
                                                <div>
                                                    <div className="font-medium">Secret Key (sk_live_...)</div>
                                                    <div className="text-xs text-slate-500">Uso no backend (privada)</div>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="publishable">
                                                <div>
                                                    <div className="font-medium">Publishable Key (pk_live_...)</div>
                                                    <div className="text-xs text-slate-500">Uso no frontend (pública)</div>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 py-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-900">
                                            <p className="font-semibold mb-1">Atenção!</p>
                                            <p>Esta é a única vez que você verá esta chave completa. Salve-a em um local seguro.</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label>Sua Nova Chave de API</Label>
                                    <div className="relative mt-2">
                                        <Input
                                            value={generatedKey}
                                            readOnly
                                            type={showKey ? 'text' : 'password'}
                                            className="font-mono text-sm pr-20"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setShowKey(!showKey)}
                                            >
                                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleCopyKey(generatedKey)}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            {!generatedKey ? (
                                <>
                                    <Button type="button" variant="outline" onClick={handleClose}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleGenerateKey} disabled={loading || !keyName}>
                                        {loading ? 'Gerando...' : 'Gerar Chave'}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleClose} className="w-full">
                                    Entendi, Fechar
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* API Keys Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Chaves Ativas</CardTitle>
                    <CardDescription>
                        Chaves de API criadas para este projeto
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Chave</TableHead>
                                <TableHead>Criada em</TableHead>
                                <TableHead>Último uso</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_API_KEYS.map((key) => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium">{key.name}</TableCell>
                                    <TableCell>
                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                                            {key.key_prefix}••••{key.key_hint}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(key.created_at).toLocaleDateString('pt-BR')}
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {key.last_used_at
                                            ? new Date(key.last_used_at).toLocaleDateString('pt-BR')
                                            : 'Nunca'}
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
                </CardContent>
            </Card>
        </div>
    );
}
