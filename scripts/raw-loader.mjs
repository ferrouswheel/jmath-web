// Match Vite's ?raw imports in Node tests, reading the very same source files.
import { readFile } from 'node:fs/promises';
export async function load(url, context, nextLoad) {
  if (url.endsWith('?raw')) {
    const source = await readFile(new URL(url.slice(0, -4)), 'utf8');
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${JSON.stringify(source)};`,
    };
  }
  return nextLoad(url, context);
}
