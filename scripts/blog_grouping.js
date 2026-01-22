
const fs = require('fs');
const path = require('path');

const INVENTORY_FILE = path.join(__dirname, '../blog_inventory.json');
const OUTPUT_FILE = path.join(__dirname, '../docs/BLOG_GROUPS.md');

function groupArticles() {
    if (!fs.existsSync(INVENTORY_FILE)) {
        console.error('Inventory file not found. Run scripts/blog_inventory.js first.');
        return;
    }

    const inventory = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));

    // Logic to score/prioritize articles
    const scoredUpdates = inventory.map(item => {
        let score = 0;
        const lowerTitle = item.title.toLowerCase();

        // High intent / High value keywords
        if (lowerTitle.includes('guia definitivo')) score += 10;
        if (lowerTitle.includes('como fazer') || lowerTitle.includes('como implementar')) score += 8;
        if (lowerTitle.includes('tutorial')) score += 8;
        if (lowerTitle.includes('erro numero 1') || lowerTitle.includes('erro comum')) score += 7;
        if (lowerTitle.includes('a verdade sobre')) score += 7;
        if (lowerTitle.includes('estrategia')) score += 6;
        if (lowerTitle.includes('futuro de')) score += 5;
        if (lowerTitle.includes('vs') || lowerTitle.includes('comparativo')) score += 6;

        return { ...item, score };
    });

    // Sort by score descending
    scoredUpdates.sort((a, b) => b.score - a.score);

    // Take top 100
    const top100 = scoredUpdates.slice(0, 100);

    // Group by category to ensure clusters
    const groups = {};
    top100.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
    });

    // Flatten back to chunks of 5, trying to keep categories together
    const chunkedGroups = [];
    let currentChunk = [];
    let groupCounter = 1;

    Object.keys(groups).forEach(cat => {
        const articles = groups[cat];
        articles.forEach(article => {
            currentChunk.push(article);
            if (currentChunk.length === 5) {
                chunkedGroups.push({ id: groupCounter++, articles: currentChunk, category: cat });
                currentChunk = [];
            }
        });
    });

    // If leftovers, add to last or new group
    if (currentChunk.length > 0) {
        chunkedGroups.push({ id: groupCounter++, articles: currentChunk, category: 'Mixed/Remaining' });
    }

    // Generate Markdown
    let markdown = `## 🗓 Cronograma de Execução (20 Grupos)\n\n`;
    markdown += `> **Total de Artigos Prioritários:** ${top100.length}\n`;
    markdown += `> **Critério de Priorização:** Keywords de alta intenção (Guia, Tutorial, Erros, Comparativos)\n\n`;

    chunkedGroups.slice(0, 20).forEach(group => {
        markdown += `### Grupo ${String(group.id).padStart(2, '0')} - Foco: ${group.category}\n`;
        markdown += `**Objetivo:** Dominar a semântica de ${group.category} com conteúdo denso.\n\n`;
        markdown += `| Ordem | Artigo Atual (Slug) | Ação Recomendada |\n`;
        markdown += `| :--- | :--- | :--- |\n`;

        group.articles.forEach((art, idx) => {
            markdown += `| ${idx + 1} | \`${art.slug}\` | Reescrever (Template Padrão) |\n`;
        });
        markdown += `\n**Links Internos Sugeridos:** Help Center > ${group.category}, Feature Page > ${group.category}\n`;
        markdown += `**CTA:** Agendar Demo focada em ${group.category}\n`;
        markdown += `---\n\n`;
    });

    if (!fs.existsSync(path.join(__dirname, '../docs'))) {
        fs.mkdirSync(path.join(__dirname, '../docs'));
    }

    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log(`Groups generated in ${OUTPUT_FILE}`);
}

groupArticles();
