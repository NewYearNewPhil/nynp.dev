import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const collectionEntries = await getCollection('blog');
// Map the array of content collection entries to create an object.
// Converts [{ id: 'post.md', data: { title: 'Example', description: '' } }]
// to { 'post.md': { title: 'Example', description: '' } }
const pages = Object.fromEntries(collectionEntries.map(({ slug, data }) => [slug, data]));

export const { getStaticPaths, GET } = OGImageRoute({
  // Tell us the name of your dynamic route segment.
  // In this case it’s `route`, because the file is named `[...route].ts`.
  param: 'route',

  // A collection of pages to generate images for.
  // The keys of this object are used to generate the path for that image.
  // In this example, we generate one image at `/open-graph/example.png`.
  pages: pages,
  // For each page, this callback will be used to customize the OpenGraph image.
  getImageOptions: (path, page) => ({
    title: page.title,
    //description: page.metaDescription,
    bgGradient: [[255,255,255]],
    fonts: ['./node_modules/@fontsource/share-tech-mono/files/share-tech-mono-latin-400-normal.woff2'],
    font: {
        title: {
            families: ["Share Tech Mono"],
            color: [0,0,0],
        },
        description: {
            families: ["Share Tech Mono"],
            color: [0,0,0],
        },
    },
    logo: {
      path: './public/logo.png',
      size: [200,200]
    },
    border: {
      side: 'block-start',
      color: [0,255,255],
      width: 40,
    }
    // There are a bunch more options you can use here!
  }),
});