import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster position="top-right" richColors />
            <div className="grid grid-cols-[240px_1fr] h-screen">
                <Sidebar />
                <div className="flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-8">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </main>
                </div>
            </div>
        </div>
    );
}
