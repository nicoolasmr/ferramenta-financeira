import { XMLParser } from "fast-xml-parser";

export interface OFXTransaction {
    id: string; // FITID
    amount: number; // TRNAMT
    date: Date; // DTPOSTED
    description: string; // MEMO or NAME
    type: 'DEBIT' | 'CREDIT'; // TRNTYPE
}

export class OFXParser {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: true,
            parseTagValue: true,
        });
    }

    public parse(xmlContent: string): OFXTransaction[] {
        // OFX files sometimes have a SGML header (key:value) before the XML.
        // We need to strip that or fast-xml-parser might choke if it's not pure XML.
        // A simple heuristic is to find the first "<OFX>" tag.

        const ofxStartIndex = xmlContent.indexOf('<OFX>');
        if (ofxStartIndex === -1) {
            // Try lowercase
            const ofxStartIndexLower = xmlContent.indexOf('<ofx>');
            if (ofxStartIndexLower === -1) throw new Error("Invalid OFX file: No <OFX> tag found.");
            xmlContent = xmlContent.substring(ofxStartIndexLower);
        } else {
            xmlContent = xmlContent.substring(ofxStartIndex);
        }

        // Some OFX files are not valid XML (missing closing tags). 
        // fast-xml-parser handles some of this, but true SGML OFX is hard.
        // However, most modern banks provide XML-compliant OFX (OFX 2.0).
        // Let's assume XML-compliant or try our best.

        // Also, clean up messy newlines if needed.

        try {
            const jsonObj = this.parser.parse(xmlContent);
            return this.extractTransactions(jsonObj);
        } catch (error) {
            console.error("OFX Parsing Error:", error);
            throw new Error("Failed to parse OFX file.");
        }
    }

    private extractTransactions(obj: any): OFXTransaction[] {
        const transactions: OFXTransaction[] = [];

        // Traverse to find STMTTRN (Statement Transaction) list
        // Path usually: OFX -> BANKMSGSRSV1 -> STMTTRNRS -> STMTRS -> BANKTRANLIST -> STMTTRN
        // But structure can vary slightly. We will look for BANKTRANLIST.

        const findNode = (node: any, name: string): any => {
            if (!node) return null;
            if (node[name]) return node[name];
            for (const key in node) {
                if (typeof node[key] === 'object') {
                    const found = findNode(node[key], name);
                    if (found) return found;
                }
            }
            return null;
        };

        const bankTranList = findNode(obj, "BANKTRANLIST");
        if (!bankTranList || !bankTranList.STMTTRN) return [];

        const rawTransactions = Array.isArray(bankTranList.STMTTRN)
            ? bankTranList.STMTTRN
            : [bankTranList.STMTTRN];

        for (const trn of rawTransactions) {
            try {
                // Parse Date: YYYYMMDDHHMMSS...
                const dateStr = String(trn.DTPOSTED).substring(0, 8); // YYYYMMDD
                const year = parseInt(dateStr.substring(0, 4));
                const month = parseInt(dateStr.substring(4, 6)) - 1; // JS Month is 0-indexed
                const day = parseInt(dateStr.substring(6, 8));
                const date = new Date(year, month, day);

                const amount = parseFloat(trn.TRNAMT);

                transactions.push({
                    id: String(trn.FITID),
                    amount: amount,
                    date: date,
                    description: trn.MEMO || trn.NAME || "Unknown Transaction",
                    type: trn.TRNTYPE === 'CREDIT' ? 'CREDIT' : 'DEBIT'
                });
            } catch (err) {
                console.warn("Skipping malformed transaction:", trn);
            }
        }

        return transactions;
    }
}
