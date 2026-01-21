import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { startOfDay } from 'date-fns';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export type Post = {
    slug: string;
    frontmatter: {
        title: string;
        date: string;
        excerpt: string;
        category: string;
        tags: string[];
        updatedAt?: string;
        readingTime?: string;
        keywords?: string[];
        author?: string;
    };
    content: string;
};

export function getPostBySlug(slug: string): Post | null {
    try {
        const realSlug = slug.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug: realSlug,
            frontmatter: data as Post['frontmatter'],
            content,
        };
    } catch {
        return null;
    }
}

export function getAllPosts(): Post[] {
    if (!fs.existsSync(postsDirectory)) return [];

    const slugs = fs.readdirSync(postsDirectory);
    const posts = slugs
        .filter((slug) => slug.endsWith('.mdx'))
        .map((slug) => getPostBySlug(slug))
        .filter((post): post is Post => post !== null)
        .sort((post1, post2) => (post1.frontmatter.date > post2.frontmatter.date ? -1 : 1));
    return posts;
}

export function getPostsByCategory(category: string): Post[] {
    return getAllPosts().filter(
        (post) => post.frontmatter.category.toLowerCase() === category.toLowerCase()
    );
}

export const CATEGORIES = [
    "Receita Previsível",
    "Gestão Financeira",
    "Tecnologia SaaS",
    "Estratégia B2B"
];
