import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://nynp.dev',
  integrations: [tailwind(), react(), sitemap(), mdx()],
  output: 'static',
  devToolbar: {
    enabled: false
  },
  prefetch: true,
  markdown: {
    shikiConfig: {
      wrap: true
    },
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { rel: ['nofollow'] }
      ],
      rehypeSlug,
      [rehypeAutolinkHeadings,
        {
          behavior: 'append',
        }],
    ],
  },
  vite: {
    define: {
      "process.env.is_IS_PREACT": false
    },
    build: {
      assetsInlineLimit: 32768,
      rollupOptions: {
        output: {
          assetFileNames: '_astro/asset.[hash][extname]'
        }
      }
    }
  }
});