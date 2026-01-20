export function parseCSV(text: string): Record<string, string>[] {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim());
        const obj: Record<string, string> = {};

        headers.forEach((h, index) => {
            obj[h] = values[index] || "";
        });

        result.push(obj);
    }
    return result;
}
