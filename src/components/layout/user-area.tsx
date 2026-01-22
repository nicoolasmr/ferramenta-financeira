"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/actions/auth";
import { getBillingInfo, Subscription } from "@/actions/billing";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import {
    CreditCard,
    ChevronUp,
    LogOut,
    User as UserIcon,
    Zap,
    Crown,
    Check
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

export function UserArea() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [user, setUser] = useState<any>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUserData() {
            setLoading(true);
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);

                if (activeOrganization) {
                    const billing = await getBillingInfo(activeOrganization.id);
                    setSubscription(billing);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadUserData();
    }, [activeOrganization]);

    const planName = subscription?.plan?.name || "Free Plan";
    const isPro = subscription?.plan?.code === "pro" || subscription?.plan?.code === "agency";

    if (orgLoading || loading) {
        return (
            <div className="flex items-center gap-3 p-4 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-20" />
                    <div className="h-2 bg-slate-200 rounded w-24" />
                </div>
            </div>
        );
    }

    return (
        <div className="mt-auto border-t bg-white p-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors group">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm group-hover:shadow-md transition-all">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member'}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                                    isPro ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                                )}>
                                    {planName}
                                </span>
                            </div>
                        </div>
                        <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mb-2 p-2" sideOffset={12}>
                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-semibold leading-none">{user?.user_metadata?.full_name || 'RevenueOS User'}</p>
                            <p className="text-xs leading-none text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2" />

                    <div className="px-2 mb-2">
                        <div className="bg-slate-50 border rounded-lg p-3 relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Your Plan</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                        {isPro ? <Crown className="h-3.5 w-3.5 text-amber-500" /> : <Zap className="h-3.5 w-3.5 text-blue-500" />}
                                        {planName}
                                    </p>
                                    {!isPro && (
                                        <Link href="/app/billing">
                                            <span className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer">Upgrade</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DropdownMenuItem asChild>
                        <Link href="/app/settings/profile" className="flex items-center gap-2 cursor-pointer">
                            <UserIcon className="h-4 w-4" />
                            <span>My Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/app/settings/organization" className="flex items-center gap-2 cursor-pointer">
                            <CreditCard className="h-4 w-4" />
                            <span>Billing & Payments</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    <Dialog>
                        <DialogTrigger asChild>
                            <div className="flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors w-full">
                                <LogOut className="h-4 w-4" />
                                <span>Sign Out</span>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Confirm Sign Out</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to sign out? You will need to log in again to access your financial operations.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex items-center gap-3 mt-6">
                                <DialogClose asChild>
                                    <Button variant="outline" className="flex-1">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    className="flex-1 shadow-md hover:shadow-lg transition-all"
                                    onClick={async () => {
                                        await signOut();
                                    }}
                                >
                                    Sign Out
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuContent>
            </DropdownMenu>

            {!isPro && (
                <div className="px-2 mt-2">
                    <Button asChild size="sm" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-0 shadow-sm h-8">
                        <Link href="/app/billing" className="flex items-center justify-center gap-2">
                            <Zap className="h-3.5 w-3.5 fill-white" />
                            <span className="text-xs font-bold uppercase tracking-wider">Upgrade to Pro</span>
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
