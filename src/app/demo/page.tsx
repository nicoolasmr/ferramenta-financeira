'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'lucide-react';

// Use a simplified layout for the demo to simulate the app
export default function DemoPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'reconciliation' | 'aging'>('dashboard');

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
            {/* Demo Header */}
            <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="font-bold text-lg tracking-tight">RevenueOS <span className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded ml-2">DEMO MODE</span></div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" className="text-white hover:text-white/80" onClick={() => window.location.href = '/'}>Sair da Demo</Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold" onClick={() => window.location.href = '/signup'}>Criar Conta Real</Button>
                    </div>
                </div>
            </header>

            {/* Simulated App Navigation */}
            <div className="bg-white border-b px-4 py-2 shadow-sm">
                <div className="container mx-auto flex gap-6 text-sm font-medium">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`pb-2 border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Visão Geral
                    </button>
                    <button
                        onClick={() => setActiveTab('reconciliation')}
                        className={`pb-2 border-b-2 transition-colors ${activeTab === 'reconciliation' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Conciliação (Delta)
                    </button>
                    <button
                        onClick={() => setActiveTab('aging')}
                        className={`pb-2 border-b-2 transition-colors ${activeTab === 'aging' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Aging Report
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto p-6 max-w-7xl">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">MRR (Outubro)</h3>
                                <p className="text-3xl font-bold text-slate-900">R$ 482.390</p>
                                <span className="text-xs text-emerald-600 font-medium">▲ 12% vs mês anterior</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Net Revenue</h3>
                                <p className="text-3xl font-bold text-slate-900">R$ 450.012</p>
                                <span className="text-xs text-slate-400">Após taxas e impostos</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Inadimplência</h3>
                                <p className="text-3xl font-bold text-slate-900 text-emerald-600">0.8%</p>
                                <span className="text-xs text-slate-400">Baixíssimo risco</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border shadow-sm">
                                <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Active Customers</h3>
                                <p className="text-3xl font-bold text-slate-900">1,240</p>
                                <span className="text-xs text-emerald-600 font-medium">+45 novos essa semana</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border shadow-sm h-96 flex items-center justify-center bg-slate-50">
                            <p className="text-slate-400 font-medium flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" /> Gráfico de Evolução de Receita (Demo Visual)
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'reconciliation' && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="font-bold text-lg">Discrepâncias Encontradas (Outubro)</h2>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Resolver Selecionados</Button>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4">Transaction ID</th>
                                    <th className="p-4">Gateway (Stripe)</th>
                                    <th className="p-4">Banco (Itaú)</th>
                                    <th className="p-4 text-red-600">Delta (Diferença)</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4 font-mono text-slate-500">tx_12389012</td>
                                    <td className="p-4">R$ 1.200,00</td>
                                    <td className="p-4">R$ 1.150,00</td>
                                    <td className="p-4 text-red-600 font-bold">- R$ 50,00</td>
                                    <td className="p-4"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">Taxa não esperada</span></td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4 font-mono text-slate-500">tx_12389015</td>
                                    <td className="p-4">R$ 5.000,00</td>
                                    <td className="p-4">R$ 0,00</td>
                                    <td className="p-4 text-red-600 font-bold">- R$ 5.000,00</td>
                                    <td className="p-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Floating Delay</span></td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="p-4 bg-yellow-50 text-yellow-800 text-sm flex gap-2 items-center">
                            <span className="font-bold">⚠️ Atenção:</span> O sistema detectou R$ 5.050,00 em divergências que requerem atenção manual ou ajuste de regra.
                        </div>
                    </div>
                )}

                {activeTab === 'aging' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border shadow-sm p-6">
                            <h2 className="font-bold text-lg mb-6">Aging Report (Vencimentos)</h2>
                            <div className="flex gap-4">
                                <div className="flex-1 bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-center">
                                    <div className="text-emerald-700 font-bold mb-1">Em dia</div>
                                    <div className="text-2xl font-bold">R$ 840k</div>
                                    <div className="text-xs text-emerald-600">92% do total</div>
                                </div>
                                <div className="flex-1 bg-yellow-50 rounded-lg p-4 border border-yellow-100 text-center">
                                    <div className="text-yellow-700 font-bold mb-1">1-30 dias</div>
                                    <div className="text-2xl font-bold">R$ 45k</div>
                                    <div className="text-xs text-yellow-600">Ação: Email Automático</div>
                                </div>
                                <div className="flex-1 bg-orange-50 rounded-lg p-4 border border-orange-100 text-center">
                                    <div className="text-orange-700 font-bold mb-1">31-60 dias</div>
                                    <div className="text-2xl font-bold">R$ 12k</div>
                                    <div className="text-xs text-orange-600">Ação: Bloqueio de Acesso</div>
                                </div>
                                <div className="flex-1 bg-red-50 rounded-lg p-4 border border-red-100 text-center">
                                    <div className="text-red-700 font-bold mb-1">&gt; 90 dias</div>
                                    <div className="text-2xl font-bold">R$ 5k</div>
                                    <div className="text-xs text-red-600">Ação: Protesto/Jurídico</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Banner Fixed Bottom */}
            <div className="bg-slate-900 text-white p-4 text-center z-50">
                <span className="opacity-80">Você está explorando o modo de demonstração. Os dados são fictícios.</span>
                <Button variant="link" className="text-emerald-400 font-bold ml-2 hover:text-emerald-300" onClick={() => window.location.href = '/signup'}>
                    Começar com seu projeto real &rarr;
                </Button>
            </div>
        </div>
    );
}

// Icons
function BarChart3(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    )
}
