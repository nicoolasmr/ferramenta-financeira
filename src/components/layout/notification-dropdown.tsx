"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Notification } from "@/lib/notifications";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notifications";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NotificationDropdown() {
    const { activeOrganization } = useOrganization();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const fetchNotifications = async () => {
        if (!activeOrganization) return;
        setLoading(true);
        try {
            const data = await getNotifications(activeOrganization.id);
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeOrganization) {
            fetchNotifications();
            // Polling for demo purposes, in production use Supabase Realtime
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [activeOrganization]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (error) {
            toast.error("Erro ao marcar como lida");
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!activeOrganization) return;
        try {
            await markAllAsRead(activeOrganization.id);
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            toast.success("Todas as notificações marcadas como lidas");
        } catch (error) {
            toast.error("Erro ao marcar todas como lidas");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case "error": return <Info className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 px-2 text-blue-600 hover:text-blue-700"
                            onClick={handleMarkAllAsRead}
                        >
                            Marcar tudo como lido
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[350px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                            <Bell className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">Nenhuma notificação por enquanto.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={cn(
                                        "p-4 hover:bg-slate-50 transition-colors relative group",
                                        !n.read_at && "bg-blue-50/50"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">{getIcon(n.type)}</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn("text-xs font-semibold", !n.read_at ? "text-slate-900" : "text-slate-600")}>
                                                    {n.title}
                                                </p>
                                                {!n.read_at && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(n.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 transition-opacity"
                                                        title="Marcar como lida"
                                                    >
                                                        <Check className="h-3 w-3 text-slate-500" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center justify-between pt-1">
                                                <p className="text-[10px] text-slate-400 capitalize">
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                                                </p>
                                                {n.link && (
                                                    <Link
                                                        href={n.link}
                                                        className="text-[10px] font-medium text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        Ver Detalhes <ExternalLink className="h-2 w-2" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500" disabled>
                        Ver todas as notificações
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
