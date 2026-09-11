import { sequenceTerm } from './sequences.js';
export const sequenceLanguages = {js:'JavaScript',python:'Python',c:'C'};
const bodies={
  squares:{js:'const k = BigInt(n);\nreturn k * k;',python:'return n * n',c:'uint64_t k = n;\n*out = k * k;'},
  cubes:{js:'const k = BigInt(n);\nreturn k * k * k;',python:'return n * n * n',c:'uint64_t k = n;\n*out = k * k * k;'},
  triangular:{js:'const k = BigInt(n);\nreturn k * (k + 1n) / 2n;',python:'return n * (n + 1) // 2',c:'uint64_t k = n;\n*out = k * (k + 1) / 2;'},
  pentagonal:{js:'const k = BigInt(n);\nreturn k * (3n * k - 1n) / 2n;',python:'return n * (3 * n - 1) // 2',c:'uint64_t k = n;\n*out = k == 0 ? 0 : k * (3 * k - 1) / 2;'},
  hexagonal:{js:'const k = BigInt(n);\nreturn k * (2n * k - 1n);',python:'return n * (2 * n - 1)',c:'uint64_t k = n;\n*out = k == 0 ? 0 : k * (2 * k - 1);'},
  fibonacci:{js:'let a = 0n, b = 1n;\nfor (let i = 0; i < n; i++) [a, b] = [b, a + b];\nreturn a;',python:'a, b = 0, 1\nfor _ in range(n):\n    a, b = b, a + b\nreturn a',c:'if (n == 0) { *out = 0; return true; }\nuint64_t a = 0, b = 1;\nfor (unsigned i = 1; i < n; i++) {\n    uint64_t next = a + b;\n    a = b;\n    b = next;\n}\n*out = b;'},
  'powers-of-two':{js:'return 2n ** BigInt(n);',python:'return 2 ** n',c:'*out = UINT64_C(1) << n;'},
  primes:{js:'let found = 0;\nfor (let candidate = 2; ; candidate++) {\n  let prime = true;\n  for (let d = 2; d * d <= candidate; d++) {\n    if (candidate % d === 0) { prime = false; break; }\n  }\n  if (prime && ++found === n) return BigInt(candidate);\n}',python:'found, candidate = 0, 2\nwhile True:\n    prime, d = True, 2\n    while d * d <= candidate:\n        if candidate % d == 0:\n            prime = False\n            break\n        d += 1\n    if prime:\n        found += 1\n        if found == n:\n            return candidate\n    candidate += 1',c:'unsigned found = 0;\nfor (uint64_t candidate = 2; ; candidate++) {\n    bool prime = true;\n    for (uint64_t d = 2; d <= candidate / d; d++) {\n        if (candidate % d == 0) { prime = false; break; }\n    }\n    if (prime && ++found == n) { *out = candidate; break; }\n}'},
};
const indent=(s,n)=>s.split('\n').map(line=>' '.repeat(n)+line).join('\n');
export const cSequenceLimit = sequence => sequence.id==='fibonacci'?93:sequence.id==='powers-of-two'?63:1000;
export function sequenceSnippet(sequence,language,n,{example=true}={}){
  sequenceTerm(sequence,n);
  if(!sequenceLanguages[language])throw new RangeError('Unknown language');
  const name='nth_'+sequence.id.replaceAll('-','_'),body=bodies[sequence.id][language];
  if(language==='js')return `// Exact integers using built-in BigInt; no external libraries.\n// Indexing: n starts at ${sequence.min}.\nfunction ${name}(n) {\n  if (!Number.isInteger(n) || n < ${sequence.min} || n > 1000)\n    throw new RangeError("n must be an integer from ${sequence.min} to 1000");\n${indent(body,2)}\n}\n`+(example?`\nconsole.log(${name}(${n}).toString());\n`:'');
  if(language==='python')return `# Python integers are exact; no external libraries.\n# Indexing: n starts at ${sequence.min}.\ndef ${name}(n):\n    if not isinstance(n, int) or isinstance(n, bool) or not ${sequence.min} <= n <= 1000:\n        raise ValueError("n must be an integer from ${sequence.min} to 1000")\n${indent(body,4)}\n`+(example?`\nprint(${name}(${n}))\n`:'');
  const limit=cSequenceLimit(sequence);
  return `// Standard C99 only. Exact within the guarded uint64_t range.\n// Supported indices: ${sequence.min} through ${limit}.\n// Compile: cc -std=c99 sequence.c -o sequence\n#include <stdint.h>\n#include <stdbool.h>\n#include <stddef.h>\n#include <stdio.h>\n#include <inttypes.h>\n\nbool ${name}(unsigned n, uint64_t *out) {\n    if (out == NULL || n > ${limit}${sequence.min?` || n < ${sequence.min}`:''}) return false;\n${indent(body,4)}\n    return true;\n}\n`+(example?`\nint main(void) {\n    uint64_t result;\n    if (!${name}(${n}, &result)) {\n        fprintf(stderr, "n must be from ${sequence.min} to ${limit} for this C implementation.\\n");\n        return 1;\n    }\n    printf("%" PRIu64 "\\n", result);\n    return 0;\n}\n`:'');
}
