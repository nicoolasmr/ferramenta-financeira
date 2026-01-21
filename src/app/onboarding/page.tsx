'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, CheckCircle2 } from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Dados da Empresa', icon: Building2 },
    { id: 2, title: 'Endereço Fiscal', icon: Building2 },
    { id: 3, title: 'Convide sua Equipe', icon: Users },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1
        name: '',
        legal_name: '',
        tax_id: '',
        // Step 2
        street: '',
        number: '',
        city: '',
        state: '',
        zip_code: '',
        // Step 3
        team_emails: [''],
    });

    const handleNext = async () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            // Final step - create organization
            setLoading(true);
            try {
                // TODO: Implement API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                router.push('/app');
            } catch (error) {
                alert('Erro ao criar organização');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const addTeamMember = () => {
        setFormData({
            ...formData,
            team_emails: [...formData.team_emails, ''],
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-slate-400 border-2 border-slate-300'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <CheckCircle2 className="w-6 h-6" />
                                        ) : (
                                            <step.icon className="w-6 h-6" />
                                        )}
                                    </div>
                                    <span className="text-xs mt-2 text-slate-600 font-medium text-center">
                                        {step.title}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`h-1 flex-1 mx-4 rounded transition-all ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-300'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <Card className="shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {currentStep === 1 && 'Bem-vindo ao RevenueOS!'}
                            {currentStep === 2 && 'Endereço Fiscal'}
                            {currentStep === 3 && 'Monte sua Equipe'}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1 && 'Vamos começar configurando sua organização'}
                            {currentStep === 2 && 'Informe o endereço que aparecerá em documentos fiscais'}
                            {currentStep === 3 && 'Convide membros da sua equipe (opcional)'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Step 1: Company Info */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
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
                            </div>
                        )}

                        {/* Step 2: Address */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
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
                            </div>
                        )}

                        {/* Step 3: Team */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    Convide membros da sua equipe para colaborar. Você pode pular esta etapa e adicionar depois.
                                </p>
                                {formData.team_emails.map((email, index) => (
                                    <div key={index}>
                                        <Label htmlFor={`email-${index}`}>Email do Membro {index + 1}</Label>
                                        <Input
                                            id={`email-${index}`}
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                const newEmails = [...formData.team_emails];
                                                newEmails[index] = e.target.value;
                                                setFormData({ ...formData, team_emails: newEmails });
                                            }}
                                            placeholder="email@empresa.com"
                                        />
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addTeamMember} className="w-full">
                                    + Adicionar Outro Membro
                                </Button>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                Voltar
                            </Button>
                            <Button onClick={handleNext} disabled={loading || !formData.name}>
                                {loading ? 'Criando...' : currentStep === 3 ? 'Finalizar' : 'Próximo'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Skip Link */}
                {currentStep === 3 && (
                    <div className="text-center mt-4">
                        <button
                            onClick={() => router.push('/app')}
                            className="text-sm text-slate-600 hover:text-slate-900 underline"
                        >
                            Pular e adicionar depois
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
