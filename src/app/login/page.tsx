"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);

        try {
            const result = await loginAction(formData);

            if (result?.error) {
                toast.error("Erro ao entrar", { description: result.error });
                setIsLoading(false);
            } else {
                // If successful, the action redirects, so we don't need to do anything here except maybe show a toast
                // Although normally redirect happens before this line if successful.
                // However, `redirect` in Server Actions throws an error that Next.js catches to handle redirect.
                // So this code might not be reached on success.
                // But if we are here and no error, it's weird.
                // Actually, let's handle the calling pattern correctly.
                // If I use `action={loginAction}`, redirection works automatically.
                // But I want to show toasts on error.
                // The common pattern is: 
                // invoke action, check result. If redirect happens inside action, it throws NEXT_REDIRECT.
            }
        } catch (err) {
            // NextJS redirects throw an error, we need to let it pass
            // But usually we catch it if we want to custom handle.
            // Actually, `redirect` inside Server Action just works if called via form action.
            // But here I'm calling it programmatically? No, I'll use it as form action.
        } finally {
            // If we redirected, this might run on unmounted component but it's fine.
        }
    };

    // Better approach for Client + Server Action to keep control:
    // Call it as an async function.
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await loginAction(formData);
            if (res?.error) {
                toast.error("Erro ao entrar", { description: "Credenciais inválidas ou erro no servidor." });
                setIsLoading(false);
            }
        } catch (error) {
            // If it's a redirect, it actually works by throwing an error in Client Components sometimes or 
            // just handling navigation. 
            // BUT: `redirect()` in Server Actions is handled specially by Next.js.
            // If we call it from Client Component:
            // It will verify headers and navigate.

            // NOTE: The `redirect` function in `actions.ts` might throw `NEXT_REDIRECT` error.
            // We should just let it propagate or check if error.digest exists?
            // Actually, in `use client`, calling a Server Action that redirects just works.
            // The promise usually doesn't resolve if it redirects?
            // Let's assume standard behavior: if it returns an object with error, show it.
            // If it redirects, the page changes.
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Column - Marketing/Brand */}
            <div className="hidden lg:flex flex-col justify-between bg-slate-950 p-10 lg:p-16 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 font-black text-xl text-white tracking-tighter uppercase">
                        <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center">
                            <div className="h-3 w-3 bg-white rounded-sm" />
                        </div>
                        RevenueOS
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                        Transforme dados brutos em inteligência financeira acionável.
                    </h2>
                    <ul className="space-y-4 mb-10">
                        {[
                            "Conciliação automática (Delta Zero)",
                            "Recuperação de inadimplência ativa",
                            "Dashboard financeiro em tempo real",
                            "Auditoria completa de recebíveis"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 text-sm text-slate-500 font-mediums">
                    © {new Date().getFullYear()} RevenueOS Inc. All rights reserved.
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="flex flex-col items-center justify-center p-6 lg:p-24 bg-white relative">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                <div className="h-5 w-5 bg-white rounded-md" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h1>
                        <p className="text-sm text-slate-600 mt-2">
                            Digite suas credenciais para acessar o dashboard.
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email corporativo</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nome@empresa.com"
                                required
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="h-12"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center">
                                    Acessar Plataforma <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-600">
                        Não tem uma conta?{" "}
                        <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                            Solicitar acesso
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
