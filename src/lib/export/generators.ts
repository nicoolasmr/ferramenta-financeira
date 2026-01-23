import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ColumnDef {
    value: string;
    label: string;
}

// === CSV GENERATOR ===
export function generateCSV(data: any[], columns: string[]): string {
    if (!data || data.length === 0) return '';

    // We assume data keys match column values, or we filter based on columns list if provided
    // Ideally columns shouldn't be just strings but definitions to map labels
    // But for now keeping compatibility with existing logic which passed string[]

    const header = columns.join(',');
    const rows = data.map(row => {
        return columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return '';
            // Escape quotes and wrap in quotes if contains comma
            const stringVal = String(val);
            if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
            }
            return stringVal;
        }).join(',');
    }).join('\n');

    return `${header}\n${rows}`;
}

export function downloadCSV(csvContent: string, fileName: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// === JSON GENERATOR ===
export function generateJSON(data: any[], fileName: string) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// === PDF GENERATOR ===
export function generatePDF(data: any[], columns: ColumnDef[], title: string, fileName: string) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Date
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated on: ${dateStr}`, 14, 30);

    // Table
    autoTable(doc, {
        startY: 35,
        head: [columns.map(c => c.label)],
        body: data.map(row => columns.map(c => {
            const val = row[c.value];

            // Format formatters could go here (dates, currency)
            if (val instanceof Date) return val.toLocaleDateString();
            if (typeof val === 'object' && val !== null) return JSON.stringify(val);

            return String(val ?? '-');
        })),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }, // Blueish
    });

    doc.save(fileName);
}
