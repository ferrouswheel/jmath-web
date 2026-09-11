import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  server: { host: '0.0.0.0', port: 5173 },
  devToolbar: { enabled: false },
});
