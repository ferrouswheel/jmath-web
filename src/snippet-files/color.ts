// These imports provide the exact reviewed source text to Vite and the Node test loader.
import source0 from '../../snippets/color/adjustments.c?raw';
import source1 from '../../snippets/color/adjustments.js?raw';
import source2 from '../../snippets/color/adjustments.py?raw';
import source3 from '../../snippets/color/conversion.c?raw';
import source4 from '../../snippets/color/conversion.js?raw';
import source5 from '../../snippets/color/conversion.py?raw';
import source6 from '../../snippets/color/transfer.c?raw';
import source7 from '../../snippets/color/transfer.js?raw';
import source8 from '../../snippets/color/transfer.py?raw';
const sources: Record<string, string> = {
  'adjustments/c': source0,
  'adjustments/js': source1,
  'adjustments/python': source2,
  'conversion/c': source3,
  'conversion/js': source4,
  'conversion/python': source5,
  'transfer/c': source6,
  'transfer/js': source7,
  'transfer/python': source8,
};
export function snippetFile(id: string, language: string): string {
  const source = sources[id + '/' + language];
  if (source === undefined) throw new RangeError('Unknown snippet');
  return source;
}
