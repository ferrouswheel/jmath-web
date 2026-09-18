// These imports provide the exact reviewed source text to Vite and the Node test loader.
import source0 from '../snippets/spherical-harmonics/basis.c?raw';
import source1 from '../snippets/spherical-harmonics/basis.js?raw';
import source2 from '../snippets/spherical-harmonics/basis.py?raw';
const sources: Record<string, string> = {
  'basis/c': source0,
  'basis/js': source1,
  'basis/python': source2,
};
export function shSnippet(language: string): string {
  const source = sources['basis/' + language];
  if (source === undefined) throw new RangeError('Unknown snippet');
  return source;
}
export const shLanguages: Record<string, string> = {
  js: 'JavaScript',
  python: 'Python',
  c: 'C',
};
