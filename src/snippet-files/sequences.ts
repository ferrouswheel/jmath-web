// These imports provide the exact reviewed source text to Vite and the Node test loader.
import source0 from '../../snippets/sequences/cubes.c?raw';
import source1 from '../../snippets/sequences/cubes.js?raw';
import source2 from '../../snippets/sequences/cubes.py?raw';
import source3 from '../../snippets/sequences/fibonacci.c?raw';
import source4 from '../../snippets/sequences/fibonacci.js?raw';
import source5 from '../../snippets/sequences/fibonacci.py?raw';
import source6 from '../../snippets/sequences/hexagonal.c?raw';
import source7 from '../../snippets/sequences/hexagonal.js?raw';
import source8 from '../../snippets/sequences/hexagonal.py?raw';
import source9 from '../../snippets/sequences/pentagonal.c?raw';
import source10 from '../../snippets/sequences/pentagonal.js?raw';
import source11 from '../../snippets/sequences/pentagonal.py?raw';
import source12 from '../../snippets/sequences/powers-of-two.c?raw';
import source13 from '../../snippets/sequences/powers-of-two.js?raw';
import source14 from '../../snippets/sequences/powers-of-two.py?raw';
import source15 from '../../snippets/sequences/primes.c?raw';
import source16 from '../../snippets/sequences/primes.js?raw';
import source17 from '../../snippets/sequences/primes.py?raw';
import source18 from '../../snippets/sequences/squares.c?raw';
import source19 from '../../snippets/sequences/squares.js?raw';
import source20 from '../../snippets/sequences/squares.py?raw';
import source21 from '../../snippets/sequences/triangular.c?raw';
import source22 from '../../snippets/sequences/triangular.js?raw';
import source23 from '../../snippets/sequences/triangular.py?raw';
const sources: Record<string, string> = {
  'cubes/c': source0,
  'cubes/js': source1,
  'cubes/python': source2,
  'fibonacci/c': source3,
  'fibonacci/js': source4,
  'fibonacci/python': source5,
  'hexagonal/c': source6,
  'hexagonal/js': source7,
  'hexagonal/python': source8,
  'pentagonal/c': source9,
  'pentagonal/js': source10,
  'pentagonal/python': source11,
  'powers-of-two/c': source12,
  'powers-of-two/js': source13,
  'powers-of-two/python': source14,
  'primes/c': source15,
  'primes/js': source16,
  'primes/python': source17,
  'squares/c': source18,
  'squares/js': source19,
  'squares/python': source20,
  'triangular/c': source21,
  'triangular/js': source22,
  'triangular/python': source23,
};
export function snippetFile(id: string, language: string): string {
  const source = sources[id + '/' + language];
  if (source === undefined) throw new RangeError('Unknown snippet');
  return source;
}
