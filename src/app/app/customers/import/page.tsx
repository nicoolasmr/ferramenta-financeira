"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { parseCSV } from "@/lib/csv/parser";
import { validateCustomers, checkDuplicates } from "@/lib/csv/validator";
import { importCustomers, getImportTemplate, type ImportResult } from "@/actions/customers/import";
import { downloadCSV } from "@/lib/csv/parser";

type Step = 'upload' | 'preview' | 'importing' | 'complete';

export default function ImportCustomersPage() {
    const router = useRouter();
    const { activeOrganization } = useOrganization();
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [validData, setValidData] = useState<any[]>([]);
    const [invalidData, setInvalidData] = useState<any[]>([]);
    const [duplicates, setDuplicates] = useState<number[]>([]);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            toast.error('Please select a CSV file');
            return;
        }

        setFile(selectedFile);

        try {
            const parsed = await parseCSV(selectedFile);
            setParsedData(parsed.data);

            // Validate data
            const validation = validateCustomers(parsed.data);
            setValidData(validation.valid);
            setInvalidData(validation.invalid);

            // Check for duplicates
            const dupCheck = checkDuplicates(validation.valid, 'email');
            setDuplicates(dupCheck.duplicates);

            setStep('preview');
        } catch (error) {
            console.error('Parse error:', error);
            toast.error('Failed to parse CSV file');
        }
    };

    const handleImport = async () => {
        if (!activeOrganization || validData.length === 0) return;

        setStep('importing');
        setProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await importCustomers(activeOrganization.id, validData);

            clearInterval(progressInterval);
            setProgress(100);
            setImportResult(result);
            setStep('complete');

            if (result.success > 0) {
                toast.success(`Successfully imported ${result.success} customers!`);
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Failed to import customers');
            setStep('preview');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const template = await getImportTemplate();
            downloadCSV(template, 'customers_template.csv');
            toast.success('Template downloaded!');
        } catch (error) {
            toast.error('Failed to download template');
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Import Customers</h1>
                <p className="text-slate-500">Bulk upload customers from a CSV file</p>
            </div>

            {/* Upload Step */}
            {step === 'upload' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload CSV File</CardTitle>
                        <CardDescription>
                            Select a CSV file containing your customer data. Need help? Download our template.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={handleDownloadTemplate}>
                                <Download className="h-4 w-4 mr-2" />
                                Download Template
                            </Button>
                        </div>

                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="csv-upload"
                            />
                            <label htmlFor="csv-upload" className="cursor-pointer">
                                <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                                <p className="text-lg font-medium">Click to upload or drag and drop</p>
                                <p className="text-sm text-slate-500 mt-2">CSV files only (max 50MB)</p>
                            </label>
                        </div>

                        <Alert>
                            <FileText className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Required columns:</strong> name<br />
                                <strong>Optional columns:</strong> email, phone, document
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Preview Step */}
            {step === 'preview' && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview & Validation</CardTitle>
                            <CardDescription>
                                Review the data before importing. Invalid rows will be skipped.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold text-green-900">{validData.length}</p>
                                        <p className="text-sm text-green-700">Valid Rows</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <XCircle className="h-8 w-8 text-red-600" />
                                    <div>
                                        <p className="text-2xl font-bold text-red-900">{invalidData.length}</p>
                                        <p className="text-sm text-red-700">Invalid Rows</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                                    <div>
                                        <p className="text-2xl font-bold text-yellow-900">{duplicates.length}</p>
                                        <p className="text-sm text-yellow-700">Duplicates</p>
                                    </div>
                                </div>
                            </div>

                            {invalidData.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>{invalidData.length} rows have errors:</strong>
                                        <ul className="mt-2 space-y-1">
                                            {invalidData.slice(0, 5).map((item, idx) => (
                                                <li key={idx} className="text-sm">
                                                    Row {item.row}: {item.errors.join(', ')}
                                                </li>
                                            ))}
                                            {invalidData.length > 5 && (
                                                <li className="text-sm italic">...and {invalidData.length - 5} more</li>
                                            )}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep('upload')}>
                                    Back
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={validData.length === 0}
                                >
                                    Import {validData.length} Customers
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Importing Step */}
            {step === 'importing' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Importing...</CardTitle>
                        <CardDescription>Please wait while we import your customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={progress} className="w-full" />
                        <p className="text-center mt-4 text-sm text-slate-500">{progress}% complete</p>
                    </CardContent>
                </Card>
            )}

            {/* Complete Step */}
            {step === 'complete' && importResult && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Complete!</CardTitle>
                        <CardDescription>Your customers have been imported</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                <p className="text-3xl font-bold text-green-900">{importResult.success}</p>
                                <p className="text-sm text-green-700">Imported</p>
                            </div>
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                <p className="text-3xl font-bold text-yellow-900">{importResult.skipped}</p>
                                <p className="text-sm text-yellow-700">Skipped (Duplicates)</p>
                            </div>
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                                <p className="text-3xl font-bold text-red-900">{importResult.failed}</p>
                                <p className="text-sm text-red-700">Failed</p>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => {
                                setStep('upload');
                                setFile(null);
                                setParsedData([]);
                                setValidData([]);
                                setInvalidData([]);
                                setImportResult(null);
                            }}>
                                Import More
                            </Button>
                            <Button onClick={() => router.push('/app/customers')}>
                                View Customers
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
