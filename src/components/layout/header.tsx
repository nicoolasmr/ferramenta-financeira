"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationDropdown } from "./notification-dropdown";

export function Header() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1 flex items-center gap-4">
                <form className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            type="search"
                            placeholder="Search customers, projects..."
                            className="w-full bg-slate-50 pl-8 border-slate-200"
                        />
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-2">
                <NotificationDropdown />
            </div>
        </header>
    );
}
