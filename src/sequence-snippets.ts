import { sequenceTerm } from './sequences.ts';
import { snippetFile } from './snippet-files/sequences.ts';
import type { Sequence } from './types.ts';
export const sequenceLanguages = { js: 'JavaScript', python: 'Python', c: 'C' };
export const cSequenceLimit = (sequence: Sequence) =>
  sequence.id === 'fibonacci'
    ? 93
    : sequence.id === 'powers-of-two'
      ? 63
      : 1000;
export function sequenceSnippet(
  sequence: Sequence,
  language: string,
  n: number,
  { example = true } = {},
) {
  sequenceTerm(sequence, n);
  const source = snippetFile(sequence.id, language);
  const name = 'nth_' + sequence.id.replaceAll('-', '_'),
    limit = cSequenceLimit(sequence);
  if (language === 'js')
    return (
      source + (example ? `\nconsole.log(${name}(${n}).toString());\n` : '')
    );
  if (language === 'python')
    return source + (example ? `\nprint(${name}(${n}))\n` : '');
  return (
    source +
    (example
      ? `\nint main(void) {\n    uint64_t result;\n    if (!${name}(${n}, &result)) {\n        fprintf(stderr, "n must be from ${sequence.min} to ${limit} for this C implementation.\\n");\n        return 1;\n    }\n    printf("%" PRIu64 "\\n", result);\n    return 0;\n}\n`
      : '')
  );
}
