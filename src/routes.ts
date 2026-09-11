import { distributions } from './distributions.ts';

export const distributionUrl = (d: { id: string }) =>
  `/distributions/${d.id.replaceAll('_', '-')}`;
export const distributionAtPath = (pathname: string) =>
  distributions.find((d) => distributionUrl(d) === pathname.replace(/\/$/, ''));
export const isCataloguePath = (pathname: string) =>
  pathname === '/' || pathname === '/index.html';

export function randomToolAtPath(pathname: string) {
  const path = pathname.replace(/\/$/, '');
  if (path === '/random-tools') return { kind: null };
  if (path === '/random-tools/dice') return { kind: 'dice' };
  if (path === '/random-tools/coins') return { kind: 'coins' };
  return null;
}
