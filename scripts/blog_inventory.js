
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '../content/blog');
const OUTPUT_FILE = path.join(__dirname, '../blog_inventory.json');

function getBlogInventory() {
    if (!fs.existsSync(BLOG_DIR)) {
        console.error(`Directory not found: ${BLOG_DIR}`);
        return;
    }

    const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
    const inventory = [];

    console.log(`Scanning ${files.length} files...`);

    files.forEach(file => {
        const filePath = path.join(BLOG_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const { data, content: body } = matter(content);

        // Basic word count estimation
        const wordCount = body.trim().split(/\s+/).length;

        // Detect likely category from filename or title if not present
        let category = data.category || 'General';
        const lowerTitle = (data.title || file).toLowerCase();

        if (lowerTitle.includes('api')) category = 'API & Integrações';
        else if (lowerTitle.includes('financeiro') || lowerTitle.includes('cfo')) category = 'Financeiro & Billing';
        else if (lowerTitle.includes('vendas') || lowerTitle.includes('sales')) category = 'Vendas & CRM';
        else if (lowerTitle.includes('growth') || lowerTitle.includes('marketing')) category = 'Growth & Marketing';
        else if (lowerTitle.includes('tech') || lowerTitle.includes('dev')) category = 'Tech & Engenharia';
        else if (lowerTitle.includes('ops') || lowerTitle.includes('operacoes')) category = 'RevOps & Operações';
        else if (lowerTitle.includes('ux') || lowerTitle.includes('design')) category = 'UX & Produto';
        else if (lowerTitle.includes('saas')) category = 'SaaS Management';

        inventory.push({
            slug: file.replace(/\.mdx?$/, ''),
            filename: file,
            title: data.title || file.replace(/-/g, ' ').replace(/\.mdx?$/, ''),
            description: data.description || '',
            date: data.publishedAt || data.date || '',
            wordCount,
            category,
            headings: (body.match(/^#{2,3} /gm) || []).length
        });
    });

    // Sort by category then title
    inventory.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.title.localeCompare(b.title);
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2));
    console.log(`Inventory saved to ${OUTPUT_FILE} with ${inventory.length} items.`);
}

getBlogInventory();
