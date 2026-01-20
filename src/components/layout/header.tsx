"use client";

export function Header() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
                {/* Breadcrumbs or Title could go here */}
                <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
                {/* Actions like Notifications or Theme Toggle */}
            </div>
        </header>
    );
}
