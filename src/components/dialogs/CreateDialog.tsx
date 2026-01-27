"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Field {
    name: string;
    label: string;
    type: "text" | "email" | "number" | "textarea" | "select";
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    validation?: (value: string) => string | null;
}

interface CreateDialogProps {
    title: string;
    description?: string;
    fields: Field[];
    onSubmit: (data: Record<string, string>) => Promise<void>;
    triggerLabel?: string;
}

export function CreateDialog({
    title,
    description,
    fields,
    onSubmit,
    triggerLabel = "Create",
}: CreateDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (field: Field, value: string): string | null => {
        if (field.required && !value.trim()) {
            return `${field.label} is required`;
        }
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
            setFormData({});
            setErrors({});
        } catch (error) {
            console.error("Error creating:", error);
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
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {triggerLabel}
                </Button>
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
                                <Label htmlFor={field.name}>
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                {field.type === "textarea" ? (
                                    <Textarea
                                        id={field.name}
                                        placeholder={field.placeholder}
                                        value={formData[field.name] || ""}
                                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                        className={errors[field.name] ? "border-red-500" : ""}
                                    />
                                ) : field.type === "select" ? (
                                    <Select
                                        value={formData[field.name] || ""}
                                        onValueChange={(value) => handleFieldChange(field.name, value)}
                                    >
                                        <SelectTrigger className={errors[field.name] ? "border-red-500" : ""}>
                                            <SelectValue placeholder={field.placeholder || "Select an option"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
