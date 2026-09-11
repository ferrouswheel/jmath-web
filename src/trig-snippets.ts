import { snippetFile } from './snippet-files/trigonometry.ts';
import type { TrigFunction } from './types.ts';
export const trigLanguages = { js: 'JavaScript', python: 'Python', c: 'C' };
const names: Record<string, string> = {
  sin: 'sine',
  cos: 'cosine',
  tan: 'tangent',
  arcsin: 'arcsine',
  arccos: 'arccosine',
  arctan: 'arctangent',
};
export function trigSnippet(
  item: TrigFunction,
  language: string,
  input: number,
  { example = true } = {},
) {
  if (!Number.isFinite(input)) throw new RangeError('Invalid snippet request');
  const source = snippetFile(item.id, language),
    name = names[item.id];
  if (language === 'js')
    return source + (example ? `\n\nconsole.log(${name}(${input}));\n` : '');
  if (language === 'python')
    return source + (example ? `\n\nprint(${name}(${input}))\n` : '');
  return (
    source +
    (example
      ? `\n\nint main(void) {\n    double result = ${name}(${input});\n    if (!isfinite(result)) return 1;\n    printf("%.17g\\n", result);\n    return 0;\n}\n`
      : '')
  );
}
