import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const helpDirectory = path.join(process.cwd(), 'content/help');

export type HelpArticle = {
    slug: string;
    frontmatter: {
        title: string;
        excerpt: string;
        category: string; // "Começando", "Projetos", "Vendas", etc.
        updatedAt: string;
        keywords?: string[];
    };
    content: string;
};

export function getHelpArticleBySlug(slug: string): HelpArticle | null {
    try {
        const realSlug = slug.replace(/\.mdx$/, '');
        const fullPath = path.join(helpDirectory, `${realSlug}.mdx`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug: realSlug,
            frontmatter: data as HelpArticle['frontmatter'],
            content,
        };
    } catch {
        return null;
    }
}

export function getAllHelpArticles(): HelpArticle[] {
    if (!fs.existsSync(helpDirectory)) return [];

    const slugs = fs.readdirSync(helpDirectory);
    const articles = slugs
        .filter((slug) => slug.endsWith('.mdx'))
        .map((slug) => getHelpArticleBySlug(slug))
        .filter((article): article is HelpArticle => article !== null)
        .sort((a, b) => (a.frontmatter.title > b.frontmatter.title ? 1 : -1)); // Alphabetical

    return articles;
}

export const HELP_CATEGORIES = [
    { id: "getting-started", label: "Começando" },
    { id: "projects", label: "Projetos" },
    { id: "sales", label: "Vendas & Clientes" },
    { id: "payments", label: "Pagamentos & Recebíveis" },
    { id: "integrations", label: "Integrações" },
    { id: "copilot", label: "IA Copilot" },
    { id: "security", label: "Segurança & Permissões" },
    { id: "ops", label: "Ops & Troubleshooting" }
];
