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
import { useLanguage } from "@/components/providers/LanguageProvider";
import { UserArea } from "./user-area";

export function Sidebar() {
    const pathname = usePathname();
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const { t } = useLanguage();

    const links = [
        {
            href: "/app",
            label: t("common.dashboard"),
            icon: LayoutDashboard,
        },
        {
            href: "/app/projects",
            label: t("common.projects"),
            icon: FolderKanban,
        },
        {
            href: "/app/customers",
            label: t("common.customers"),
            icon: Users,
        },
        {
            href: "/app/integrations",
            label: t("common.integrations"),
            icon: Plug,
        },
        {
            href: "/app/receivables/aging",
            label: t("common.receivables"),
            icon: Calendar,
        },
        {
            href: "/app/sales",
            label: t("common.sales_funnel"),
            icon: TrendingUp,
        },
        {
            href: "/app/copilot",
            label: t("common.copilot"),
            icon: Sparkles,
        },
    ];

    const settingsRoutes = [
        {
            label: "Configurações",
            items: [
                {
                    label: "Organização",
                    href: "/app/settings/organization",
                    icon: Settings,
                },
                {
                    label: "Equipe",
                    href: "/app/settings/team",
                    icon: Users,
                },
                {
                    label: "Segurança",
                    href: "/app/settings/security",
                    icon: Shield,
                },
            ],
        },
    ];

    return (
        <aside className="hidden border-r bg-muted/30 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        <span className="text-lg font-bold tracking-tight">RevenueOS</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-2">
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
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all outline-none",
                                        isActive
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground/60")} />
                                    {link.label}
                                </Link>
                            );
                        })}

                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mt-4">
                            {t("common.settings")}
                        </div>
                        {settingsRoutes.map((link) => {
                            const Icon = link.icon;
                            // Check if the current path starts with the link href
                            // Special case for 'General' or other root settings if needed, but here structure is flat
                            const isActive = pathname.startsWith(link.href);
                            return (
                                <div key={link.label}>
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1 mt-2">
                                        {link.label}
                                    </div>
                                    {link.items.map((subItem) => {
                                        const SubIcon = subItem.icon;
                                        const isSubActive = pathname.startsWith(subItem.href);
                                        return (
                                            <Link
                                                key={subItem.href}
                                                href={subItem.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all outline-none",
                                                    isSubActive
                                                        ? "bg-primary/10 text-primary font-bold"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                                )}
                                            >
                                                <SubIcon className={cn("h-4 w-4", isSubActive ? "text-primary" : "text-muted-foreground/60")} />
                                                {subItem.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </nav>
                </div>
                <UserArea />
            </div>
        </aside>
    );
}
