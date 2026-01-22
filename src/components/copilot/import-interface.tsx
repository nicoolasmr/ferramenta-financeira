"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, FileUp, Loader2, Upload } from "lucide-react";
import { parseCSV } from "@/lib/import/csv";
import { validateImportData, ImportRow } from "@/lib/import/mapping";
import { processBulkImport } from "@/actions/copilot/bulk-import";
import { toast } from "sonner";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function ImportInterface() {
    const { activeOrganization } = useOrganization();
    const [csvText, setCsvText] = useState("");
    const [previewData, setPreviewData] = useState<{ valid: ImportRow[], errors: any[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"input" | "preview" | "done">("input");
    const [stats, setStats] = useState({ processed: 0, failed: 0 });

    const handlePreview = () => {
        try {
            const rows = parseCSV(csvText);
            const validation = validateImportData(rows);
            setPreviewData(validation);
            setStep("preview");
        } catch (e) {
            toast.error("Failed to parse CSV. Check format.");
        }
    };

    const handleImport = async () => {
        if (!previewData?.valid.length) return;
        setLoading(true);
        try {
            // Hardcoded org/proj for MVP context
            const res = await processBulkImport(previewData.valid, activeOrganization?.id || "org-1", "proj-1");
            setStats({ processed: res.processed, failed: res.failed });
            setStep("done");
            toast.success(`Import complete: ${res.processed} processed`);
        } catch (e) {
            toast.error("Import failed");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCsvText("");
        setPreviewData(null);
        setStep("input");
    };

    return (
        <Card className="border-dashed border-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-5 w-5" /> Bulk Import Enrollments
                </CardTitle>
                <CardDescription>
                    Paste your CSV data below. Top row must be headers: <strong>name, email, total_amount, installments</strong>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === "input" && (
                    <div className="space-y-4">
                        <Textarea
                            placeholder={`name,email,total_amount,installments\nJohn Doe,john@example.com,5000,10\nJane Smith,jane@example.com,1200,3`}
                            rows={10}
                            value={csvText}
                            onChange={(e) => setCsvText(e.target.value)}
                            className="font-mono text-sm"
                        />
                        <div className="bg-slate-50 p-3 rounded text-xs text-muted-foreground">
                            Note: Amounts strictly in numeric or R$ format. Installments 1-36.
                        </div>
                    </div>
                )}

                {step === "preview" && previewData && (
                    <div className="space-y-4">
                        <div className="flex gap-4 text-sm">
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                {previewData.valid.length} Valid Rows
                            </Badge>
                            <Badge variant="outline" className="text-red-600 border-red-200">
                                {previewData.errors.length} Errors
                            </Badge>
                        </div>

                        <div className="border rounded-md max-h-[300px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Inst.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.valid.map((row, i) => (
                                        <TableRow key={`valid-${i}`}>
                                            <TableCell><CheckCircle className="h-4 w-4 text-green-500" /></TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>R$ {row.total_amount}</TableCell>
                                            <TableCell>{row.installments}x</TableCell>
                                        </TableRow>
                                    ))}
                                    {previewData.errors.map((err, i) => (
                                        <TableRow key={`err-${i}`} className="bg-red-50">
                                            <TableCell><AlertCircle className="h-4 w-4 text-red-500" /></TableCell>
                                            <TableCell colSpan={3} className="text-red-600 text-xs">
                                                Row {err.row}: {JSON.stringify(err.errors)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {step === "done" && (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium">Import Successfully Completed</h3>
                        <p className="text-muted-foreground">
                            Processed: {stats.processed} <br />
                            Failed: {stats.failed}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-between">
                {step === "input" && (
                    <Button onClick={handlePreview} disabled={!csvText.trim()}>Preview Data</Button>
                )}
                {step === "preview" && (
                    <div className="flex gap-2 w-full justify-end">
                        <Button variant="ghost" onClick={() => setStep("input")}>Back</Button>
                        <Button onClick={handleImport} disabled={loading || previewData?.valid.length === 0}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Import Valid Rows
                        </Button>
                    </div>
                )}
                {step === "done" && (
                    <Button variant="outline" onClick={handleReset} className="w-full">
                        Import More
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
