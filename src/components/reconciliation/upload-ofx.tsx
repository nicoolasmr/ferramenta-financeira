"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadOFX } from "@/actions/reconciliation";

export function UploadOFXDialog({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadOFX(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(`Processed ${res.count} transactions successfully`);
                if (onUploadSuccess) onUploadSuccess();
            }
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <input
                type="file"
                accept=".ofx,.xml"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploading ? "Parsing..." : "Import OFX"}
            </Button>
        </div>
    );
}
