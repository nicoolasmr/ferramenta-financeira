import { PublicHeader } from "@/components/layout/public-header";
import { Shield, Lock, Server } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <PublicHeader />
            <main className="flex-1 container py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-6">Security & Compliance</h1>
                <p className="text-xl text-muted-foreground mb-12">
                    Your data security is our top priority. Inspect our protocols and compliance standards.
                </p>

                <div className="space-y-12">
                    <section className="flex gap-4">
                        <div className="flex-none"><Shield className="h-8 w-8 text-blue-600" /></div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Bank-Grade Encryption</h2>
                            <p className="text-muted-foreground mb-4">
                                All data is encrypted at rest (AES-256) and in transit (TLS 1.3).
                                We use Supabase Vault for sensitive secrets like API Tokens.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-4">
                        <div className="flex-none"><Server className="h-8 w-8 text-blue-600" /></div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Infrastructure Isolation</h2>
                            <p className="text-muted-foreground mb-4">
                                Every organization's data is logically isolated using Row Level Security (RLS) policies.
                                We perform daily backups and redundant storage.
                            </p>
                        </div>
                    </section>

                    <section className="flex gap-4">
                        <div className="flex-none"><Lock className="h-8 w-8 text-blue-600" /></div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Access Control</h2>
                            <p className="text-muted-foreground mb-4">
                                Strict RBAC (Role-Based Access Control) ensures only authorized members of your team can access sensitive financial data.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
