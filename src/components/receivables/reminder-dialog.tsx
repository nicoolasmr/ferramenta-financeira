"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageSquare, Mail, Send } from "lucide-react";
import { REMINDER_TEMPLATES } from "@/lib/templates/reminders";
import { sendEmailReminder, getWhatsAppLink } from "@/actions/receivables/remind";
import { toast } from "sonner";

interface ReminderDialogProps {
    receivableId: string;
    customerName: string;
}

export function ReminderDialog({ receivableId, customerName }: ReminderDialogProps) {
    const [open, setOpen] = useState(false);
    const [templateId, setTemplateId] = useState('friendly');
    const [loading, setLoading] = useState(false);

    const handleSendEmail = async () => {
        setLoading(true);
        try {
            await sendEmailReminder(receivableId, templateId);
            toast.success("Email reminder sent!");
            setOpen(false);
        } catch (e) {
            toast.error("Failed to send email");
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = async () => {
        setLoading(true);
        try {
            const link = await getWhatsAppLink(receivableId, templateId);
            if (link) {
                window.open(link, '_blank');
                toast.success("WhatsApp opened!");
                setOpen(false);
            } else {
                toast.error("Could not generate link (missing phone?)");
            }
        } catch (e) {
            toast.error("Failed to generate WhatsApp link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Send className="h-3 w-3 mr-2" />
                    Remind
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Reminder</DialogTitle>
                    <DialogDescription>
                        Choose a template to remind {customerName} about this payment.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Template</Label>
                        <Select value={templateId} onValueChange={setTemplateId}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {REMINDER_TEMPLATES.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between">
                    <Button variant="outline" onClick={handleWhatsApp} disabled={loading} className="w-full sm:w-auto">
                        <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                        WhatsApp
                    </Button>
                    <Button onClick={handleSendEmail} disabled={loading} className="w-full sm:w-auto">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
