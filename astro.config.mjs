import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import path from 'node:path';
import icon from "astro-icon";



export default defineConfig({
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
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
