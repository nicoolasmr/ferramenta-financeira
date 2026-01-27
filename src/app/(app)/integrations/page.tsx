'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, CheckCircle2, XCircle, Settings } from 'lucide-react';

const INTEGRATIONS = [
    { id: 'stripe', name: 'Stripe', logo: '💳', status: 'connected', color: 'emerald' },
    { id: 'hotmart', name: 'Hotmart', logo: '🔥', status: 'disconnected', color: 'slate' },
    { id: 'asaas', name: 'Asaas', logo: '💰', status: 'disconnected', color: 'slate' },
    { id: 'mercadopago', name: 'Mercado Pago', logo: '🛒', status: 'disconnected', color: 'slate' },
];

export default function IntegrationsPage() {
    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Cloud className="w-8 h-8" />
                    Integrações
                </h1>
                <p className="text-slate-600 mt-2">
                    Conecte gateways de pagamento e outras ferramentas.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {INTEGRATIONS.map((integration) => (
                    <Card key={integration.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl">{integration.logo}</div>
                                    <div>
                                        <CardTitle>{integration.name}</CardTitle>
                                        <CardDescription>Gateway de pagamento</CardDescription>
                                    </div>
                                </div>
                                {integration.status === 'connected' ? (
                                    <Badge className="bg-emerald-100 text-emerald-700">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Conectado
                                    </Badge>
                                ) : (
                                    <Badge className="bg-slate-100 text-slate-600">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Desconectado
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {integration.status === 'connected' ? (
                                <div className="space-y-3">
                                    <div className="text-sm text-slate-600">
                                        <div className="flex justify-between mb-1">
                                            <span>Último sync:</span>
                                            <span className="font-medium">Há 2 minutos</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Eventos processados:</span>
                                            <span className="font-medium">1,234</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configurar
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600">
                                            Desconectar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button className="w-full">Conectar {integration.name}</Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
