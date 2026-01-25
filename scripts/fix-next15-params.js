const fs = require('fs');
const path = require('path');

const files = [
    "src/app/portal/projects/[projectId]/page.tsx",
    "src/app/(app)/projects/[projectId]/api-keys/page.tsx",
    "src/app/app/enrollments/[enrollmentId]/page.tsx",
    "src/app/app/projects/[id]/receivables/page.tsx",
    "src/app/app/projects/[id]/reconciliation/page.tsx",
    // "src/app/app/projects/[id]/cash/page.tsx", // Fixed
    "src/app/app/projects/[id]/integrations/page.tsx",
    "src/app/app/projects/[id]/integrations/[provider]/setup/page.tsx",
    "src/app/app/projects/[id]/integrations/[provider]/checklist/page.tsx",
    "src/app/app/projects/[id]/transactions/page.tsx",
    "src/app/app/projects/[id]/dunning/page.tsx",
    "src/app/app/projects/[id]/page.tsx",
    "src/app/projects/[id]/receivables/page.tsx",
    "src/app/projects/[id]/trust/page.tsx",
    "src/app/app/projects/[id]/collections/page.tsx",
    "src/app/app/projects/[id]/risk/page.tsx",
    "src/app/app/projects/[id]/reconciliation/payouts/page.tsx",
    "src/app/app/customers/[customerId]/page.tsx"
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        // console.log(`Skipping ${file} (not found)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const isClient = content.includes('"use client"') || content.includes("'use client'");

    // Regex to capture: export default (async?) function Name({ params }: { params: { ... } })
    // We capture (async\s+)? ($1), Name ($2), TypeBody ($3)
    const regex = /export default (async\s+)?function (\w+)\(\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{([^}]+)\}\s*\}\s*\)\s*\{/g;

    let modified = false;
    const newContent = content.replace(regex, (match, asyncGroup, funcName, typeBody) => {
        // Check if already Promise (simple check if typeBody includes Promise, though regex expects { ... })
        // If the regex matched, it means it matched { params: { ... } }, effectively NOT Promise<{...}> which would be { params: Promise<{...}> }

        modified = true;
        console.log(`Fixing ${file}: ${funcName}`);

        // Construct new signature
        // If client, we need React.use(params).
        // If server, we need await params. And function must be async.

        let newSig = "";
        let preamble = "";

        if (isClient) {
            // Client component: function Name({ params }: { params: Promise<Type> })
            // Preamble: const resolvedParams = React.use(params);
            newSig = `export default function ${funcName}({ params }: { params: Promise<{${typeBody}}> }) {`;
            preamble = `    const resolvedParams = React.use(params);`;

            // Ensure React is imported? Assuming imports exist or user will fix.
            // But we can check.
        } else {
            // Server component: async function Name...
            newSig = `export default async function ${funcName}({ params }: { params: Promise<{${typeBody}}> }) {`;
            preamble = `    const resolvedParams = await params;`;
        }

        return `${newSig}\n${preamble}`;
    });

    if (modified) {
        // Replace `params.something` with `resolvedParams.something`
        // But BEWARE: `params` is still the name of the argument.
        // If I keep argument name as `params`, then `params` is a Promise.
        // `params.id` is invalid.
        // `resolvedParams.id` is valid.
        // So simple string replace `params.` -> `resolvedParams.` might work if `params` isn't used for other things.
        // But `params` variable name is shadowed? No.

        // Safe replace: `params\.` -> `resolvedParams.` (with word boundary?)
        // `params` is a common word.

        // Let's use a regex that matches `params.key` where key is one of the keys in typeBody?
        // E.g. typeBody = "id: string; provider: string" -> keys = id, provider.
        // keys = typeBody.split(';').map...

        // Simpler: Just replace `params.` with `resolvedParams.` 
        // Logic: The only `params` object in scope is the prop.
        // Unless there are other variables named params.
        // We assume not.

        let finalContent = newContent;
        // Replace usages of `params.` with `resolvedParams.`
        // Avoiding replacement in the signature itself (but strict replacement happened already).

        // We only replace `params.` followed by identifier.
        finalContent = finalContent.replace(/params\.(\w+)/g, 'resolvedParams.$1');

        fs.writeFileSync(filePath, finalContent);
    } else {
        console.log(`No match in ${file} (Regex mismatch or already fixed)`);
    }
});
