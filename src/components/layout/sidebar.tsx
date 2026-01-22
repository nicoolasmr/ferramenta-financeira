"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    Users,
    CreditCard,
    Settings,
    LayoutDashboard,
    ShoppingCart,
    Sparkles,
    FolderKanban,
    Plug,
    Calendar,
    TrendingUp,
    Shield,
    LogOut,
} from "lucide-react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
import { useOrganization } from "@/components/providers/OrganizationProvider";

export function Sidebar() {
    const pathname = usePathname();
    const { activeOrganization, loading: orgLoading } = useOrganization();

    const links = [
        {
            href: "/app",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/app/projects",
            label: "Projects",
            icon: FolderKanban,
        },
        {
            href: "/app/customers",
            label: "Customers",
            icon: Users,
        },
        {
            href: "/app/integrations",
            label: "Integrations",
            icon: Plug,
        },
        {
            href: "/app/receivables/aging",
            label: "Aging Report",
            icon: Calendar,
        },
        {
            href: "/app/sales",
            label: "Sales Funnel",
            icon: TrendingUp,
        },
        {
            href: "/app/copilot",
            label: "IA Copilot",
            icon: Sparkles,
        },
    ];

    const settingsLinks = [
        {
            href: "/app/settings/organization",
            label: "Organization",
            icon: Settings,
        },
        {
            href: "/app/settings/team",
            label: "Team",
            icon: Users,
        },
        {
            href: "/app/settings/security/mfa",
            label: "Security",
            icon: Shield,
        },
    ];

    return (
        <aside className="hidden border-r bg-slate-50/50 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        <span className="text-lg">RevenueOS</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-2">
                            Platform
                        </div>
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href || (link.href !== "/app" && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-slate-100",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 font-medium"
                                            : "text-slate-700 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            );
                        })}

                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-4">
                            Settings
                        </div>
                        {settingsLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname.startsWith(link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-slate-100",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 font-medium"
                                            : "text-slate-700 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t bg-white">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                {activeOrganization?.name?.[0] || 'U'}
                            </div>
                            <div className="text-sm flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">User</p>
                                <p className="text-xs text-slate-500 truncate">
                                    {orgLoading ? 'Carregando...' : activeOrganization?.name || 'Nenhuma Organização'}
                                </p>
                            </div>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Sair"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Confirmar Saída</DialogTitle>
                                    <DialogDescription>
                                        Tem certeza que deseja encerrar sua sessão? Você precisará fazer login novamente para acessar seus dados.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex items-center gap-3 mt-6">
                                    <DialogClose asChild>
                                        <Button variant="outline" className="flex-1">Cancelar</Button>
                                    </DialogClose>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 shadow-md hover:shadow-lg transition-all"
                                        onClick={async () => {
                                            await signOut();
                                        }}
                                    >
                                        Sair do Sistema
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </aside>
    );
}
