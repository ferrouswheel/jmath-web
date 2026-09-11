// These imports provide the exact reviewed source text to Vite and the Node test loader.
import source0 from '../../snippets/trigonometry/arccos.c?raw';
import source1 from '../../snippets/trigonometry/arccos.js?raw';
import source2 from '../../snippets/trigonometry/arccos.py?raw';
import source3 from '../../snippets/trigonometry/arcsin.c?raw';
import source4 from '../../snippets/trigonometry/arcsin.js?raw';
import source5 from '../../snippets/trigonometry/arcsin.py?raw';
import source6 from '../../snippets/trigonometry/arctan.c?raw';
import source7 from '../../snippets/trigonometry/arctan.js?raw';
import source8 from '../../snippets/trigonometry/arctan.py?raw';
import source9 from '../../snippets/trigonometry/cos.c?raw';
import source10 from '../../snippets/trigonometry/cos.js?raw';
import source11 from '../../snippets/trigonometry/cos.py?raw';
import source12 from '../../snippets/trigonometry/sin.c?raw';
import source13 from '../../snippets/trigonometry/sin.js?raw';
import source14 from '../../snippets/trigonometry/sin.py?raw';
import source15 from '../../snippets/trigonometry/tan.c?raw';
import source16 from '../../snippets/trigonometry/tan.js?raw';
import source17 from '../../snippets/trigonometry/tan.py?raw';
const sources: Record<string, string> = {
  'arccos/c': source0,
  'arccos/js': source1,
  'arccos/python': source2,
  'arcsin/c': source3,
  'arcsin/js': source4,
  'arcsin/python': source5,
  'arctan/c': source6,
  'arctan/js': source7,
  'arctan/python': source8,
  'cos/c': source9,
  'cos/js': source10,
  'cos/python': source11,
  'sin/c': source12,
  'sin/js': source13,
  'sin/python': source14,
  'tan/c': source15,
  'tan/js': source16,
  'tan/python': source17,
};
export function snippetFile(id: string, language: string): string {
  const source = sources[id + '/' + language];
  if (source === undefined) throw new RangeError('Unknown snippet');
  return source;
}
