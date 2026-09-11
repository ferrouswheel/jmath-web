import { defineConfig } from 'astro/config';
import { generateContent, contentPlugin } from './scripts/content.mjs';
generateContent();
export default defineConfig({
  vite: { plugins: [contentPlugin()] },
  output: 'static',
  trailingSlash: 'never',
  server: { host: '0.0.0.0', port: 5173 },
  devToolbar: { enabled: false },
});
