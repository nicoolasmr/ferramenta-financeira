"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Field {
    name: string;
    label: string;
    type: "text" | "email" | "number" | "textarea";
    placeholder?: string;
    validation?: (value: string) => string | null;
}

interface EditDialogProps {
    title: string;
    description?: string;
    fields: Field[];
    initialData: Record<string, any>;
    onSubmit: (data: Record<string, string>) => Promise<void>;
    trigger?: React.ReactNode;
}

export function EditDialog({
    title,
    description,
    fields,
    initialData,
    onSubmit,
    trigger,
}: EditDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (field: Field, value: string): string | null => {
        if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Invalid email format";
        }
        if (field.validation) {
            return field.validation(value);
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: Record<string, string> = {};
        fields.forEach((field) => {
            const error = validateField(field, formData[field.name] || "");
            if (error) {
                newErrors[field.name] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            setOpen(false);
            setErrors({});
        } catch (error) {
            console.error("Error updating:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        setFormData({ ...formData, [fieldName]: value });
        // Clear error when user starts typing
        if (errors[fieldName]) {
            setErrors({ ...errors, [fieldName]: "" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {fields.map((field) => (
                            <div key={field.name} className="grid gap-2">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                {field.type === "textarea" ? (
                                    <Textarea
                                        id={field.name}
                                        placeholder={field.placeholder}
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        className={errors[field.name] ? "border-red-500" : ""}
                                    />
                                ) : (
                                    <Input
                                        id={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        className={errors[field.name] ? "border-red-500" : ""}
                                    />
                                )}
                                {errors[field.name] && (
                                    <p className="text-sm text-red-500">{errors[field.name]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
