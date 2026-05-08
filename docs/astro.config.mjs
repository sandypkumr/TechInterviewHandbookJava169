import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://sandypkumr.github.io',
  base: '/TechInterviewHandbookJava169',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    react(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
      langs: ['java', 'bash', 'json', 'typescript', 'markdown'],
      wrap: false,
    },
  },
});
