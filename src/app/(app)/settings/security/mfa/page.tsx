'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Smartphone, Key, Download } from 'lucide-react';

export default function MFASetupPage() {
    const [step, setStep] = useState<'setup' | 'verify' | 'codes'>('setup');
    const [qrCode] = useState('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==');
    const [backupCodes] = useState([
        'a1b2c3d4', 'e5f6g7h8', 'i9j0k1l2', 'm3n4o5p6',
        'q7r8s9t0', 'u1v2w3x4', 'y5z6a7b8', 'c9d0e1f2'
    ]);

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Shield className="w-8 h-8" />
                    Autenticação de Dois Fatores (MFA)
                </h1>
                <p className="text-slate-600 mt-2">
                    Adicione uma camada extra de segurança à sua conta.
                </p>
            </div>

            {step === 'setup' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Configurar MFA</CardTitle>
                        <CardDescription>
                            Escaneie o QR Code com seu app autenticador
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center">
                            <img src={qrCode} alt="QR Code" className="w-48 h-48 border rounded-lg" />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Ou digite manualmente:</p>
                            <code className="text-xs bg-white px-3 py-2 rounded border block">
                                JBSWY3DPEHPK3PXP
                            </code>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-slate-600">Apps recomendados:</p>
                            <div className="flex gap-2">
                                <Badge>Google Authenticator</Badge>
                                <Badge>Authy</Badge>
                                <Badge>1Password</Badge>
                            </div>
                        </div>
                        <Button onClick={() => setStep('verify')} className="w-full">
                            Continuar
                        </Button>
                    </CardContent>
                </Card>
            )}

            {step === 'verify' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Verificar Código</CardTitle>
                        <CardDescription>
                            Digite o código de 6 dígitos do seu app
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Input placeholder="000000" maxLength={6} className="text-center text-2xl tracking-widest" />
                        <Button onClick={() => setStep('codes')} className="w-full">
                            Verificar
                        </Button>
                    </CardContent>
                </Card>
            )}

            {step === 'codes' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5" />
                            Códigos de Recuperação
                        </CardTitle>
                        <CardDescription>
                            Salve estes códigos em um local seguro. Você pode usá-los se perder acesso ao seu dispositivo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <p className="text-sm text-amber-900 font-semibold">⚠️ Importante</p>
                            <p className="text-sm text-amber-800 mt-1">
                                Cada código pode ser usado apenas uma vez. Guarde-os em um local seguro.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {backupCodes.map((code, i) => (
                                <code key={i} className="bg-slate-100 px-3 py-2 rounded text-sm font-mono">
                                    {code}
                                </code>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Baixar
                            </Button>
                            <Button className="flex-1">
                                Concluir
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{children}</span>;
}

function Input(props: any) {
    return <input {...props} className={`w-full px-4 py-2 border rounded-lg ${props.className}`} />;
}
