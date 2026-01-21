'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function AcceptInvitationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de convite inválido');
            return;
        }

        // Accept invitation
        acceptInvitation();
    }, [token]);

    const acceptInvitation = async () => {
        try {
            // TODO: Implement API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStatus('success');
            setMessage('Convite aceito com sucesso!');

            // Redirect to app after 2 seconds
            setTimeout(() => {
                router.push('/app');
            }, 2000);
        } catch (error) {
            setStatus('error');
            setMessage('Erro ao aceitar convite. O link pode ter expirado.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {status === 'loading' && <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />}
                        {status === 'success' && <CheckCircle2 className="w-16 h-16 text-emerald-600" />}
                        {status === 'error' && <XCircle className="w-16 h-16 text-red-600" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === 'loading' && 'Processando Convite...'}
                        {status === 'success' && 'Bem-vindo!'}
                        {status === 'error' && 'Erro'}
                    </CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {status === 'success' && (
                        <p className="text-sm text-slate-600">
                            Redirecionando para o dashboard...
                        </p>
                    )}
                    {status === 'error' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Entre em contato com o administrador da organização para receber um novo convite.
                            </p>
                            <Button onClick={() => router.push('/login')} className="w-full">
                                Ir para Login
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function AcceptInvitationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
        }>
            <AcceptInvitationContent />
        </Suspense>
    );
}
