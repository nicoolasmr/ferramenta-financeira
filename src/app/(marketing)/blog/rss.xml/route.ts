import { getAllPosts } from "@/lib/content/blog";

export async function GET() {
    const posts = getAllPosts();
    const siteUrl = "https://revenueos.com.br"; // Replace with actual URL

    const itemsXml = posts.map(post => `
    <item>
      <title>${post.frontmatter.title}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <description>${post.frontmatter.excerpt || ''}</description>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <guid>${siteUrl}/blog/${post.slug}</guid>
    </item>
  `).join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>RevenueOS Blog</title>
      <link>${siteUrl}/blog</link>
      <description>Inteligência Financeira para SaaS</description>
      <language>pt-BR</language>
      ${itemsXml}
    </channel>
  </rss>`;

    return new Response(rssXml, {
        headers: {
            'Content-Type': 'text/xml',
        },
    });
}
