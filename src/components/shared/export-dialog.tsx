"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileJson, FileType, Table as TableIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateCSV, downloadCSV, generateJSON, generatePDF, ColumnDef } from "@/lib/export/generators";

type ExportFormat = 'csv' | 'json' | 'pdf';

interface GlobalExportDialogProps {
    trigger?: React.ReactNode;
    title: string;
    description?: string;
    columns: ColumnDef[];
    onExport: (selectedColumns: string[], format: ExportFormat) => Promise<any[]>;
    defaultSelected?: string[];
}

export function GlobalExportDialog({
    trigger,
    title,
    description = "Select columns and format to export.",
    columns,
    onExport,
    defaultSelected
}: GlobalExportDialogProps) {
    const [open, setOpen] = useState(false);
    // Default to all if not specified, or just first 5 if too many? Let's default to all or passed default.
    const [selectedColumns, setSelectedColumns] = useState<string[]>(
        defaultSelected || columns.map(c => c.value)
    );
    const [format, setFormat] = useState<ExportFormat>('csv');
    const [exporting, setExporting] = useState(false);

    const toggleColumn = (column: string) => {
        setSelectedColumns(prev =>
            prev.includes(column)
                ? prev.filter(c => c !== column)
                : [...prev, column]
        );
    };

    const handleSelectAll = () => {
        if (selectedColumns.length === columns.length) {
            setSelectedColumns([]);
        } else {
            setSelectedColumns(columns.map(c => c.value));
        }
    };

    const handleExport = async () => {
        if (selectedColumns.length === 0) {
            toast.error('Please select at least one column');
            return;
        }

        setExporting(true);
        try {
            // 1. Fetch Data
            const data = await onExport(selectedColumns, format);

            if (!data || data.length === 0) {
                toast.warning("No data found to export.");
                setExporting(false);
                return;
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const safeTitle = title.toLowerCase().replace(/\s+/g, '_');
            const fileName = `${safeTitle}_export_${timestamp}.${format}`;

            // 2. Generate File
            if (format === 'csv') {
                const csv = generateCSV(data, selectedColumns);
                downloadCSV(csv, fileName);
            } else if (format === 'json') {
                generateJSON(data, fileName);
            } else if (format === 'pdf') {
                // Filter definitions based on selection to pass correct labels
                const selectedDefs = columns.filter(c => selectedColumns.includes(c.value));
                generatePDF(data, selectedDefs, title, fileName);
            }

            toast.success(`Exported ${data.length} records successfully!`);
            setOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label>Format</Label>
                        <Select value={format} onValueChange={(v: ExportFormat) => setFormat(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">
                                    <div className="flex items-center gap-2">
                                        <TableIcon className="w-4 h-4 text-green-600" />
                                        CSV (Excel)
                                    </div>
                                </SelectItem>
                                <SelectItem value="pdf">
                                    <div className="flex items-center gap-2">
                                        <FileType className="w-4 h-4 text-red-600" />
                                        PDF Document
                                    </div>
                                </SelectItem>
                                <SelectItem value="json">
                                    <div className="flex items-center gap-2">
                                        <FileJson className="w-4 h-4 text-orange-600" />
                                        JSON Data
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Columns</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                                onClick={handleSelectAll}
                            >
                                {selectedColumns.length === columns.length ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                        <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2 bg-slate-50">
                            {columns.map((column) => (
                                <div key={column.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`col-${column.value}`}
                                        checked={selectedColumns.includes(column.value)}
                                        onCheckedChange={() => toggleColumn(column.value)}
                                    />
                                    <Label
                                        htmlFor={`col-${column.value}`}
                                        className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                        {column.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                            {selectedColumns.length} of {columns.length} selected
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={exporting || selectedColumns.length === 0}>
                        {exporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
