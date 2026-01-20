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
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        {
            href: "/app/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/app/projects",
            label: "Projects",
            icon: ShoppingCart, // Keeping icon as is for now, or use relevant project icon
        },
        {
            href: "/app/integrations",
            label: "Integrations",
            icon: Settings,
        },
        {
            href: "/app/billing",
            label: "Billing",
            icon: CreditCard,
        },
        {
            href: "/app/sales",
            label: "Sales",
            icon: ShoppingCart,
        },
        {
            href: "/app/customers",
            label: "Customers",
            icon: Users,
        },
        {
            href: "/app/payments",
            label: "Payments",
            icon: CreditCard,
        },
        {
            href: "/app/copilot",
            label: "Copilot",
            icon: Sparkles,
        },
    ];

    const adminLinks = [
        {
            href: "/ops/overview",
            label: "Operations",
            icon: Settings,
        },
    ];

    return (
        <aside className="w-64 border-r bg-muted/40 hidden md:flex flex-col h-screen fixed left-0 top-0">
            <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="">RevenueOS</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <div className="text-muted-foreground px-3 py-2 text-xs font-semibold uppercase">
                        Platform
                    </div>
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}

                    <div className="mt-6 text-muted-foreground px-3 py-2 text-xs font-semibold uppercase">
                        Admin
                    </div>
                    {adminLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                {/* User Profile Stub */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                    <div className="text-sm">
                        <p className="font-medium">User</p>
                        <p className="text-xs text-muted-foreground">My Org</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
