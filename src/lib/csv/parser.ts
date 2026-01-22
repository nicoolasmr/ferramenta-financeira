import Papa from 'papaparse';

export interface ParsedCSV {
    data: Record<string, any>[];
    errors: ParseError[];
    meta: {
        fields: string[];
        rowCount: number;
    };
}

export interface ParseError {
    row: number;
    field: string;
    message: string;
}

export async function parseCSV(file: File): Promise<ParsedCSV> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
            complete: (results) => {
                resolve({
                    data: results.data as Record<string, any>[],
                    errors: results.errors.map(e => ({
                        row: e.row || 0,
                        field: '',
                        message: e.message
                    })),
                    meta: {
                        fields: results.meta.fields || [],
                        rowCount: results.data.length
                    }
                });
            },
            error: reject
        });
    });
}

export function generateCSV(
    data: Record<string, any>[],
    columns: string[]
): string {
    return Papa.unparse(data, {
        columns,
        header: true
    });
}

export function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

export function generateTemplate(columns: string[]): string {
    const headers = columns.join(',');
    const exampleRow = columns.map(col => {
        switch (col) {
            case 'name': return 'John Doe';
            case 'email': return 'john@example.com';
            case 'phone': return '+55 11 99999-9999';
            case 'document': return '12345678900';
            default: return '';
        }
    }).join(',');

    return `${headers}\n${exampleRow}`;
}
