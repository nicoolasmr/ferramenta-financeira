'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save } from 'lucide-react';

export default function OrganizationSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        legal_name: '',
        tax_id: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: Implement API call to update organization
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Organização atualizada com sucesso!');
        } catch (error) {
            alert('Erro ao atualizar organização');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Building2 className="w-8 h-8" />
                    Configurações da Organização
                </h1>
                <p className="text-slate-600 mt-2">
                    Gerencie os dados fiscais e informações legais da sua empresa.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>
                        <CardDescription>
                            Nome fantasia e razão social da empresa
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome da Organização *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Minha Empresa SaaS"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="legal_name">Razão Social</Label>
                            <Input
                                id="legal_name"
                                value={formData.legal_name}
                                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                                placeholder="Ex: Minha Empresa SaaS LTDA"
                            />
                        </div>
                        <div>
                            <Label htmlFor="tax_id">CNPJ</Label>
                            <Input
                                id="tax_id"
                                value={formData.tax_id}
                                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                placeholder="00.000.000/0000-00"
                                maxLength={18}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Address */}
                <Card>
                    <CardHeader>
                        <CardTitle>Endereço Fiscal</CardTitle>
                        <CardDescription>
                            Endereço que aparecerá em documentos fiscais
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <Label htmlFor="street">Logradouro</Label>
                                <Input
                                    id="street"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    placeholder="Rua, Avenida, etc."
                                />
                            </div>
                            <div>
                                <Label htmlFor="number">Número</Label>
                                <Input
                                    id="number"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    placeholder="123"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="complement">Complemento</Label>
                                <Input
                                    id="complement"
                                    value={formData.complement}
                                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                    placeholder="Sala, Andar, etc."
                                />
                            </div>
                            <div>
                                <Label htmlFor="neighborhood">Bairro</Label>
                                <Input
                                    id="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                    placeholder="Centro"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="São Paulo"
                                />
                            </div>
                            <div>
                                <Label htmlFor="state">Estado</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="SP"
                                    maxLength={2}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="zip_code">CEP</Label>
                                <Input
                                    id="zip_code"
                                    value={formData.zip_code}
                                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                                    placeholder="00000-000"
                                    maxLength={9}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
