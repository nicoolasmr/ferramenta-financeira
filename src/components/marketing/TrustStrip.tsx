import { ShieldCheck, Lock, Code2 } from "lucide-react";

const TRUST_BADGES = [
    { label: "RLS + Audit Logs", icon: ShieldCheck },
    { label: "Idempotência & Webhooks assinados", icon: Lock },
    { label: "LGPD-ready (PII masking)", icon: Code2 },
];

export function TrustStrip() {
    return (
        <section className="border-y border-slate-100 bg-white py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
                    Segurança e Conformidade
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {TRUST_BADGES.map((badge, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <badge.icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-slate-700">{badge.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
