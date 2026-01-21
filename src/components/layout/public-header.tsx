"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PublicHeader() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block">RevenueOS</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/pricing"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === "/pricing" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/docs"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === "/docs" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Documentation
                        </Link>
                        <Link
                            href="/security"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === "/security" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Security
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                    </div>
                    <nav className="flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Login</Button>
                        </Link>
                        <Link href="/precos">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
