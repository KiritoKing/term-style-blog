import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import path from 'node:path';
import icon from "astro-icon";



export default defineConfig({
  integrations: [
    react(),
    icon({
      include: {
        lucide: ["*"],
      }
    })
  ],
  vite: {
    plugins: [tailwind()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});
