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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Rocket } from 'lucide-react';
import { createProject } from '@/actions/projects';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationId?: string;
}

export function CreateProjectDialog({
    open,
    onOpenChange,
    organizationId,
}: CreateProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        environment: 'production' as 'production' | 'development' | 'staging',
        region: 'gru1' as 'gru1' | 'us-east-1',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!organizationId) {
            toast.error('Organização não encontrada');
            return;
        }

        setLoading(true);

        try {
            await createProject({
                name: formData.name,
                environment: formData.environment,
                region: formData.region,
                org_id: organizationId,
            });

            toast.success('Projeto criado com sucesso!');
            onOpenChange(false);
            setFormData({ name: '', environment: 'production', region: 'gru1' });
        } catch (error: any) {
            console.error('Create project error:', error);
            toast.error(error.message || 'Erro ao criar projeto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        Criar Novo Projeto
                    </DialogTitle>
                    <DialogDescription>
                        Projetos isolam dados e permitem gerenciar múltiplos ambientes (produção, staging, desenvolvimento).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Nome do Projeto *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Production, Staging, Development"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Um slug será gerado automaticamente (ex: production, staging)
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="environment">Ambiente</Label>
                            <Select
                                value={formData.environment}
                                onValueChange={(value: any) => setFormData({ ...formData, environment: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="production">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span>Production (Produção)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="staging">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            <span>Staging (Homologação)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="development">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span>Development (Desenvolvimento)</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="region">Região de Dados</Label>
                            <Select
                                value={formData.region}
                                onValueChange={(value: any) => setFormData({ ...formData, region: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gru1">
                                        <div>
                                            <div className="font-medium">GRU1 - São Paulo, Brasil</div>
                                            <div className="text-xs text-slate-500">Menor latência para BR</div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="us-east-1">
                                        <div>
                                            <div className="font-medium">US-EAST-1 - N. Virginia, EUA</div>
                                            <div className="text-xs text-slate-500">Menor latência para US/EU</div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                            <p className="text-blue-900 font-medium mb-1">💡 Dica</p>
                            <p className="text-blue-700">
                                Após criar o projeto, você receberá chaves de API (Secret Key e Publishable Key) para integração.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || !formData.name}>
                            {loading ? 'Criando...' : 'Criar Projeto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
