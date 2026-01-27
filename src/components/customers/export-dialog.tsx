"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { exportCustomers } from "@/actions/customers/export";
import { AVAILABLE_COLUMNS } from "@/actions/customers/constants";
import { generateCSV, downloadCSV } from "@/lib/csv/parser";

interface ExportDialogProps {
    orgId: string;
}

export function ExportDialog({ orgId }: ExportDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(['name', 'email', 'phone']);
    const [exporting, setExporting] = useState(false);

    const toggleColumn = (column: string) => {
        setSelectedColumns(prev =>
            prev.includes(column)
                ? prev.filter(c => c !== column)
                : [...prev, column]
        );
    };

    const handleExport = async () => {
        if (selectedColumns.length === 0) {
            toast.error('Please select at least one column');
            return;
        }

        setExporting(true);
        try {
            const data = await exportCustomers(orgId, { columns: selectedColumns });
            const csv = generateCSV(data, selectedColumns);
            const timestamp = new Date().toISOString().split('T')[0];
            downloadCSV(csv, `customers_export_${timestamp}.csv`);
            toast.success(`Exported ${data.length} customers!`);
            setOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export customers');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Customers</DialogTitle>
                    <DialogDescription>
                        Select which columns you want to include in the export
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        {AVAILABLE_COLUMNS.map((column) => (
                            <div key={column.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={column.value}
                                    checked={selectedColumns.includes(column.value)}
                                    onCheckedChange={() => toggleColumn(column.value)}
                                />
                                <Label
                                    htmlFor={column.value}
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    {column.label}
                                </Label>
                            </div>
                        ))}
                    </div>

                    <div className="text-sm text-slate-500">
                        {selectedColumns.length} column{selectedColumns.length !== 1 ? 's' : ''} selected
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={exporting || selectedColumns.length === 0}>
                        {exporting ? 'Exporting...' : 'Export'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
