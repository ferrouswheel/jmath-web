import { validateAdjustments } from './color-math.ts';
import { snippetFile } from './snippet-files/color.ts';
import type { AdjustmentSettings } from './types.ts';
export const colorLanguages: Record<string, string> = {
  js: 'JavaScript',
  python: 'Python',
  c: 'C',
};
export function colorAlgorithm(language: string, image = false) {
  return snippetFile(image ? 'adjustments' : 'transfer', language);
}
export function colorExample(
  language: string,
  settings: AdjustmentSettings | null = null,
) {
  if (!colorLanguages[language]) throw new RangeError('Unknown language.');
  if (!settings) {
    if (language === 'js')
      return 'console.log(decode(0.5)); // About 0.214041\nconsole.log(encode(decode(0.5))); // 0.5\n';
    if (language === 'python')
      return 'print(decode(0.5))  # About 0.214041\nprint(encode(decode(0.5)))  # 0.5\n';
    return 'int main(void) {\n    printf("%.12f\\n", decode(0.5));\n    printf("%.12f\\n", encode(decode(0.5)));\n    return 0;\n}\n';
  }
  validateAdjustments(settings);
  const { gain, exposure, contrast, brightness, gamma, space } = settings;
  if (language === 'js')
    return `const settings = {
  gain: ${gain},
  exposure: ${exposure},
  contrast: ${contrast},
  brightness: ${brightness},
  gamma: ${gamma},
  space: "${space}",
};
console.log(adjustByte(128, settings));
`;
  if (language === 'python')
    return `settings = {
    "gain": ${gain},
    "exposure": ${exposure},
    "contrast": ${contrast},
    "brightness": ${brightness},
    "gamma": ${gamma},
    "space": "${space}",
}
print(adjust_byte(128, **settings))
`;
  return `int main(void) {
    const AdjustmentSettings settings = {
        .gain = ${gain},
        .exposure = ${exposure},
        .contrast = ${contrast},
        .brightness = ${brightness},
        .gamma = ${gamma},
        .linear_light = ${space === 'linear' ? 'true' : 'false'},
    };
    printf("%d\\n", adjust_byte(128, &settings));
    return 0;
}
`;
}
export function colorSnippet(
  language: string,
  settings: AdjustmentSettings | null = null,
) {
  return (
    colorAlgorithm(language, settings !== null) +
    '\n' +
    colorExample(language, settings)
  );
}
