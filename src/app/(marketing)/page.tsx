
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    User,
    Calendar,
    RefreshCw,
    Banknote,
    ArrowRight,
    BarChart3,
    CheckCircle2,
    CreditCard,
    Globe,
    Lock,
    PieChart,
    ShieldCheck,
    Smartphone,
    Zap
} from "lucide-react";

export const metadata = {
    title: "RevenueOS - O Sistema Operacional Financeiro para SaaS Moderno",
    description: "Centralize vendas, pagamentos e parcelas. Conecte Stripe, Hotmart e Asaas. Detecte inadimplência e automatize cobranças.",
};

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans text-slate-900">

            {/* HEADER */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        RevenueOS
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="#produto" className="hover:text-slate-900 transition-colors">Produto</Link>
                        <Link href="#integracoes" className="hover:text-slate-900 transition-colors">Integrações</Link>
                        <Link href="#ia" className="hover:text-slate-900 transition-colors">IA Copilot</Link>
                        <Link href="#seguranca" className="hover:text-slate-900 transition-colors">Segurança</Link>
                        <Link href="#precos" className="hover:text-slate-900 transition-colors">Preços</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                            Login
                        </Link>
                        <Link href="/signup">
                            <Button>Agendar demo</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">

                {/* HERO SECTION */}
                <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-slate-50">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
                    <div className="container relative mx-auto max-w-6xl px-4 text-center">
                        <div className="mx-auto mb-6 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-slate-200 bg-white px-7 py-2 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <p className="text-sm font-semibold text-slate-700">
                                Segurança de Nível Bancário e Auditoria Total
                            </p>
                        </div>

                        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl mb-6">
                            Recebíveis sob controle. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Receita previsível.
                            </span>{" "}
                            Sem planilhas.
                        </h1>

                        <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
                            RevenueOS centraliza vendas, pagamentos e parcelas por projeto — conecta Stripe, Hotmart e Asaas, detecte inadimplência e te mostra o que fazer, antes do caixa apertar.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link href="/signup">
                                <Button size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                                    Agendar demo <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="#produto">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white">
                                    Ver o produto
                                </Button>
                            </Link>
                        </div>

                        {/* MINI METRICS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
                            <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Visão por Projeto</h3>
                                </div>
                                <p className="text-sm text-slate-500">Vendido vs Recebido em tempo real. Saiba exatamente o health de cada lançamento.</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Calendário de Parcelas</h3>
                                </div>
                                <p className="text-sm text-slate-500">Controle total de vencimentos, atrasos e previsões de fluxo de caixa futuro.</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">IA Copilot</h3>
                                </div>
                                <p className="text-sm text-slate-500">Inteligência que cadastra vendas e recomenda ações de cobrança automaticamente.</p>
                            </div>
                        </div>
                    </div>

                </section>

                {/* SOCIAL PROOF */}
                <section className="py-12 border-y bg-white animate-fade-in-up animation-delay-200">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
                            Feito para quem vende no Brasil (Recorrência e Parcelas)
                        </p>
                        <div className="flex justify-center gap-12 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
                            {/* Logos using text/style approximations for reliability */}
                            <div className="text-2xl font-bold tracking-tighter text-[#635BFF]">stripe</div>
                            <img src="/hotmart-logo.png" alt="Hotmart" className="h-8 object-contain" />
                            <img src="/asaas-logo.svg" alt="Asaas" className="h-8 object-contain" />
                            <div className="text-xl font-bold text-slate-700">kiwify</div>
                            <div className="text-xl font-bold text-slate-700">eduzz</div>
                        </div>
                    </div>
                </section>

                {/* PROBLEM SECTION */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                                O que quebra o caixa não é vender. <br /> É não enxergar o recebimento.
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-slate-50 p-8 rounded-2xl">
                                <div className="h-12 w-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Venda Espalhada</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Hotmart para infoproduto, Asaas para boleto, Stripe internacional.
                                    Seu dinheiro está em três lugares diferentes e nenhuma planilha bate.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl">
                                <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Parcelas Invisíveis</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Vendeu em 12x? Ótimo. Mas você só descobre que a parcela 3 atrasou
                                    quando o caixa aperta no mês seguinte. O controle manual falhou.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-8 rounded-2xl">
                                <div className="h-12 w-12 bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Operação no Escuro</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Seu time financeiro atualiza o status no WhatsApp. Ninguém confia no número final.
                                    Auditoria é impossível e a escala vira caos.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="py-20 bg-slate-900 text-white">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                                Conectar &rarr; Normalizar &rarr; Operar
                            </h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">
                                Transformamos eventos brutos de qualquer gateway em inteligência financeira padronizada.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-slate-700 -z-10"></div>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center border-4 border-slate-900 mb-6 z-10">
                                    <span className="font-bold text-xl">1</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Conecte suas fontes</h3>
                                <p className="text-slate-400">
                                    Integração nativa com Stripe, Hotmart e Asaas. Basta conectar a conta e nós puxamos o histórico.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center border-4 border-slate-900 mb-6 z-10">
                                    <span className="font-bold text-xl">2</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Camada de Verdade</h3>
                                <p className="text-slate-400">
                                    RevenueOS normaliza tudo. Uma venda é uma venda, não importa se veio do PIX ou do Cartão Internacional.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-slate-900 mb-6 z-10">
                                    <span className="font-bold text-xl">3</span>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Dash + Ações</h3>
                                <p className="text-slate-400">
                                    Receba alertas de inadimplência, visualize o calendário de recebimentos e renegocie com um clique.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRODUCT PILLARS */}
                <section id="produto" className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                                Tudo o que você precisa para operar receita
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">
                                Uma visão consolidada, quebrada por projeto.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl border hover:border-blue-500/30 transition-colors shadow-sm hover:shadow-md">
                                <div className="h-10 w-10 bg-blue-50 rounded-lg mb-6 flex items-center justify-center">
                                    <LayoutDashboard className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Projetos (Centro de Tudo)</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Produtos, vendas, pagamentos e dashboard isolados por lançamento ou área de negócio.</p>
                            </div>

                            <div className="bg-white p-8 rounded-xl border hover:border-blue-500/30 transition-colors shadow-sm hover:shadow-md">
                                <div className="h-10 w-10 bg-indigo-50 rounded-lg mb-6 flex items-center justify-center">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Perfil 360 do Comprador</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Histórico completo, parcelas pagas/abertas, contratos e status em uma tela só.</p>
                            </div>

                            <div className="bg-white p-8 rounded-xl border hover:border-blue-500/30 transition-colors shadow-sm hover:shadow-md">
                                <div className="h-10 w-10 bg-emerald-50 rounded-lg mb-6 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Calendário de Parcelas</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Vencimentos, atrasos, grace periods configuráveis e alertas preventivos.</p>
                            </div>

                            <div className="bg-white p-8 rounded-xl border hover:border-blue-500/30 transition-colors shadow-sm hover:shadow-md">
                                <div className="h-10 w-10 bg-amber-50 rounded-lg mb-6 flex items-center justify-center">
                                    <Banknote className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Renegociação sem Bagunça</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Refinancie parcelas mantendo o histórico original intacto. O sistema recalcula tudo.</p>
                            </div>

                            <div className="bg-white p-8 rounded-xl border hover:border-blue-500/30 transition-colors shadow-sm hover:shadow-md">
                                <div className="h-10 w-10 bg-purple-50 rounded-lg mb-6 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Portal do Cliente</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Área read-only para seu cliente ver faturas e status. Transparência total.</p>
                            </div>

                            <div className="bg-white p-8 rounded-xl border hover:border-blue-500/30 transition-colors shadow-sm hover:shadow-md">
                                <div className="h-10 w-10 bg-rose-50 rounded-lg mb-6 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-rose-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Ops & Auditoria</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">Webhooks, replay de eventos, logs imutáveis e rastreabilidade ponta a ponta.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DASHBOARDS SECTION */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                                Dashboards que você realmente usa
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">
                                Responda rápido: quanto vendi? quanto entrou? quanto falta? quem está devendo?
                            </p>
                        </div>

                        <div className="space-y-12">
                            {/* Dashboard 1 */}
                            <div className="rounded-2xl border bg-slate-900 p-2 lg:p-4 shadow-2xl animate-fade-in-up">
                                <div className="aspect-[16/9] bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                                    <img
                                        src="/dashboard-preview.png"
                                        alt="RevenueOS Dashboard Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-slate-400 text-sm font-medium">Dashboard Financeiro em Tempo Real</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* INTEGRATIONS */}
                <section id="integracoes" className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-5xl px-4 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 mb-12">Integrações Tier 1 + Base para Escalar</h2>

                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {/* Stripe */}
                            <div className="bg-white p-8 rounded-xl border shadow-sm flex flex-col items-center hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="h-16 w-full flex items-center justify-center mb-6">
                                    <span className="text-4xl font-bold tracking-tighter text-[#635BFF]">stripe</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Stripe</h3>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {["Billing", "Webhooks", "Conciliação"].map(tag => (
                                        <span key={tag} className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Hotmart */}
                            <div className="bg-white p-8 rounded-xl border shadow-sm flex flex-col items-center hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="h-16 w-full flex items-center justify-center mb-6">
                                    <img src="/hotmart-logo.png" alt="Hotmart" className="h-12 object-contain" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Hotmart</h3>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {["Vendas", "Comissões", "Cancelamento"].map(tag => (
                                        <span key={tag} className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Asaas */}
                            <div className="bg-white p-8 rounded-xl border shadow-sm flex flex-col items-center hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="h-16 w-full flex items-center justify-center mb-6">
                                    <img src="/asaas-logo.svg" alt="Asaas" className="h-12 object-contain" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Asaas</h3>
                                <div className="flex gap-2 flex-wrap justify-center">
                                    {["PIX", "Boleto", "Status"].map(tag => (
                                        <span key={tag} className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600">
                            <span className="font-semibold">Roadmap:</span>
                            <span>Kiwify, Eduzz, Lastlink, Mercado Pago, PagSeguro</span>
                        </div>
                    </div>
                </section>

                {/* AI COPILOT */}
                <section id="ia" className="py-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                    <div className="container mx-auto max-w-6xl px-4 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wide mb-6">
                                    <Zap className="w-3 h-3" /> Inteligência Real
                                </div>
                                <h2 className="text-3xl font-bold mb-6 sm:text-4xl text-white">
                                    IA Copilot: Seu analista financeiro 24/7.
                                </h2>
                                <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                                    Do "quero adicionar um novo mentorado" até "quais recebimentos estão em risco?" — resolva tudo em uma conversa guiada.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                                            <Smartphone className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Wizard de Cadastro</h4>
                                            <p className="text-sm text-indigo-200 mt-1">
                                                A IA pergunta os dados cruciais (cliente, plano, vencimento) e cria o projeto e as parcelas automaticamente.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Analista de Risco</h4>
                                            <p className="text-sm text-indigo-200 mt-1">
                                                Identifica padrões de inadimplência e sugere as Top 3 Ações para recuperar caixa na semana.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0"></div>
                                        <div className="bg-slate-700 rounded-lg rounded-tl-none p-3 text-sm text-slate-200 max-w-[80%]">
                                            Como está a saúde do Projeto Alpha esta semana?
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 shrink-0 flex items-center justify-center text-xs font-bold">OS</div>
                                        <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-lg rounded-tr-none p-3 text-sm text-indigo-100 max-w-[80%]">
                                            <p className="mb-2 font-semibold text-indigo-300">Análise de Risco (Confidence: 100%)</p>
                                            <p className="mb-2">Atrasos aumentaram 15%. R$ 12.000 em risco.</p>
                                            <p className="font-semibold text-white text-xs uppercase mb-1">Top 3 Ações:</p>
                                            <ul className="list-disc pl-4 space-y-1">
                                                <li>Enviar lembrete para Cliente X</li>
                                                <li>Renegociar parcela Y</li>
                                                <li>Atualizar previsão de fluxo</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section id="precos" className="py-24 bg-white">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Planos para o tamanho da sua operação</h2>
                            <p className="mt-4 text-lg text-slate-600">
                                Sem surpresas. Metering justo por volume de eventos.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {/* STARTER */}
                            <div className="p-8 rounded-2xl border bg-white flex flex-col">
                                <h3 className="font-bold text-xl text-slate-900">Starter</h3>
                                <p className="text-slate-500 text-sm mt-2">Para quem está validando.</p>
                                <div className="my-6">
                                    <span className="text-3xl font-bold text-slate-900">R$ 197</span>
                                    <span className="text-slate-500">/mês</span>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 Projeto</li>
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Até 1.000 eventos/mês</li>
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dashboards financeiros</li>
                                </ul>
                                <Button variant="outline" className="w-full">Começar</Button>
                            </div>

                            {/* PRO */}
                            <div className="p-8 rounded-2xl border-2 border-indigo-600 bg-white flex flex-col relative shadow-xl transform md:-translate-y-4">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    Recomendado
                                </div>
                                <h3 className="font-bold text-xl text-slate-900">Pro</h3>
                                <p className="text-slate-500 text-sm mt-2">Para operações em escala.</p>
                                <div className="my-6">
                                    <span className="text-3xl font-bold text-slate-900">R$ 497</span>
                                    <span className="text-slate-500">/mês</span>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Projetos Ilimitados</li>
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Até 10.000 eventos/mês</li>
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> IA Copilot Completa</li>
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Portal do Cliente</li>
                                </ul>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Agendar Demo</Button>
                            </div>

                            {/* ENTERPRISE */}
                            <div className="p-8 rounded-2xl border bg-slate-50 flex flex-col">
                                <h3 className="font-bold text-xl text-slate-900">Enterprise</h3>
                                <p className="text-slate-500 text-sm mt-2">Volume massivo e White-label.</p>
                                <div className="my-6">
                                    <span className="text-2xl font-bold text-slate-900">Sob Consulta</span>
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Eventos Ilimitados</li>
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-slate-400" /> White-label (Custom)</li>
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-slate-400" /> SLA & Suporte Dedicado</li>
                                    <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-slate-400" /> Compliance Avançado</li>
                                </ul>
                                <Button variant="outline" className="w-full">Falar com Especialista</Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-3xl px-4">
                        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Perguntas Frequentes</h2>
                        <div className="space-y-4">
                            {[
                                { q: "O RevenueOS substitui meu gateway (Stripe/Asaas)?", a: "Não. Nós nos conectamos a eles para ler os dados e centralizar a inteligência. O pagamento continua passando por onde você já confia." },
                                { q: "Consigo ver parcelas e inadimplência por projeto?", a: "Sim. Essa é a nossa especialidade. Você cria projetos (lançamentos ou produtos) e o sistema isola as finanças de cada um." },
                                { q: "Dá para renegociar sem perder histórico?", a: "Sim. O RevenueOS mantém a dívida original 'congelada' e cria um novo acordo, mantendo o rastro completo da auditoria." },
                                { q: "Quanto tempo para implementar?", a: "Horas para começar a ver dados (via conexão automática). Dias para deixar a operação redonda com automações." }
                            ].map((faq, i) => (
                                <div key={i} className="bg-white p-6 rounded-lg border">
                                    <h4 className="font-bold text-slate-900 mb-2">{faq.q}</h4>
                                    <p className="text-slate-600">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-24 bg-slate-900 text-white text-center">
                    <div className="container mx-auto max-w-4xl px-4">
                        <h2 className="text-4xl font-bold mb-6">Você não precisa vender mais.<br />Precisa receber melhor.</h2>
                        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                            Se hoje você depende de planilha e "sensação", a próxima inadimplência vai te lembrar.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signup">
                                <Button size="lg" className="h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 text-white">Agendar Demo</Button>
                            </Link>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white text-slate-900 border-none hover:bg-slate-100 shadow-md">
                                Falar com Especialista
                            </Button>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="bg-white border-t py-12">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white">
                            <BarChart3 className="h-3 w-3" />
                        </div>
                        RevenueOS
                    </div>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link href="#produto" className="hover:text-slate-900">Produto</Link>
                        <Link href="#integracoes" className="hover:text-slate-900">Integrações</Link>
                        <Link href="#seguranca" className="hover:text-slate-900">Segurança</Link>
                        <Link href="#precos" className="hover:text-slate-900">Preços</Link>
                    </div>
                    <div className="text-sm text-slate-400">
                        © 2026 Antigravity. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div >
    );
}
