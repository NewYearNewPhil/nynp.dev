import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: 'nynp.dev logs',
    description: 'Always up to date feed of all log entries on nynp.dev',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.metaDescription,
      link: `/logs/${post.slug}/`,
    })),
  });
}