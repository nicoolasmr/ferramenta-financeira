import { getAllPosts } from "@/lib/content/blog";
import { getAllHelpArticles } from "@/lib/content/help";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://revenueos.com.br"; // Replace with actual domain

    const posts = getAllPosts();
    const helpArticles = getAllHelpArticles();

    const blogUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.frontmatter.updatedAt || post.frontmatter.date),
    }));

    const helpUrls = helpArticles.map((article) => ({
        url: `${baseUrl}/ajuda/${article.slug}`,
        lastModified: new Date(article.frontmatter.updatedAt || new Date()),
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/ajuda`,
            lastModified: new Date(),
        },
        ...blogUrls,
        ...helpUrls,
    ];
}
