import { distributions } from './distributions.js';

export const distributionUrl = d => `/distributions/${d.id.replaceAll('_', '-')}`;
export const distributionAtPath = pathname => distributions.find(d => distributionUrl(d) === pathname.replace(/\/$/, ''));
export const isCataloguePath = pathname => pathname === '/' || pathname === '/index.html';

export function randomToolAtPath(pathname) {
  const path = pathname.replace(/\/$/, '');
  if (path === '/random-tools') return { kind: null };
  if (path === '/random-tools/dice') return { kind: 'dice' };
  if (path === '/random-tools/coins') return { kind: 'coins' };
  return null;
}
