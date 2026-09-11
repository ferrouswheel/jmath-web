import { colorAtPath } from './src/color-math.js';
import { trigAtPath } from './src/trigonometry.js';
import { sequenceAtPath } from './src/sequences.js';
import { distributionAtPath, randomToolAtPath } from './src/routes.js';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve(import.meta.dirname);
const allowed = new Set(['/index.html', '/src/app.js', '/src/color-math.js', '/src/color-pages.js', '/src/color-example.js', '/src/color-snippets.js', '/src/color-conversion-snippets.js', '/src/trig-math.js', '/src/trigonometry.js', '/src/trig-pages.js', '/src/trig-visuals.js', '/src/trig-snippets.js', '/src/routes.js', '/src/experiments.js', '/src/random-tools.js', '/src/sequences.js', '/src/sequence-visuals.js', '/src/sequence-snippets.js', '/src/sequence-pages.js', '/src/sequence-theorems.js', '/src/distribution-theorems.js', '/src/theorem-view.js', '/src/distributions.js', '/src/snippets.js', '/src/more-distributions.js', '/src/more-snippets.js', '/src/style.css']);
createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const distribution = distributionAtPath(pathname);
  const randomTool = randomToolAtPath(pathname);
  const sequenceRoute = sequenceAtPath(pathname);
  const trigRoute = trigAtPath(pathname);
  const colorRoute = colorAtPath(pathname);
  const missingDistribution = (pathname.startsWith('/distributions/') && !distribution) || (pathname.startsWith('/random-tools/') && !randomTool) || (pathname.startsWith('/sequences/') && !sequenceRoute) || (pathname.startsWith('/trigonometry/') && !trigRoute) || (pathname.startsWith('/color-math/') && !colorRoute);
  const path = pathname === '/' || distribution || randomTool || sequenceRoute || trigRoute || colorRoute || missingDistribution ? '/index.html' : pathname;
  if (!allowed.has(path)) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const data = await readFile(resolve(root, '.' + path));
    res.writeHead(missingDistribution ? 404 : 200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' })[extname(path)] + '; charset=utf-8' });
    res.end(data);
  } catch { res.writeHead(500); res.end('Unable to load file'); }
}).listen(Number(process.env.PORT) || 5173, '0.0.0.0', () => console.log('jmath is ready at http://localhost:' + (process.env.PORT || 5173)));
