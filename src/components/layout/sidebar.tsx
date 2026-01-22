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
} from "lucide-react";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { UserArea } from "./user-area";

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
                        <span className="text-lg font-bold tracking-tight">RevenueOS</span>
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
                                            ? "bg-blue-50 text-blue-700 font-bold"
                                            : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
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
                                            ? "bg-blue-50 text-blue-700 font-bold"
                                            : "text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <UserArea />
            </div>
        </aside>
    );
}
