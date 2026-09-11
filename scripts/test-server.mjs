import { preview } from 'astro';
// Keep the preview in Playwright's process tree, including in agent environments.
const server = await preview({ server: { host: '127.0.0.1', port: 5180 } });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await server.stop();
    process.exit(0);
  });
}
await server.closed();
