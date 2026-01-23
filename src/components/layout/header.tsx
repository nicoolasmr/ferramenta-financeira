"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationDropdown } from "./notification-dropdown";
import { ThemeToggle } from "../shared/ThemeToggle";

export function Header() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1 flex items-center gap-4">
                <form className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Type ⌘K to search..."
                            className="w-full bg-muted/50 pl-8 border-input"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationDropdown />
            </div>
        </header>
    );
}
