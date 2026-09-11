import { colorSpaces, validateColor } from './color-math.ts';
import { snippetFile } from './snippet-files/color.ts';
const ids = colorSpaces.map((s) => s.id);
export function conversionAlgorithm(language: string) {
  return snippetFile('conversion', language);
}
export function conversionExample(
  language: string,
  {
    source,
    target,
    values,
  }: { source: string; target: string; values: number[] },
) {
  validateColor(source, values);
  if (!ids.includes(target)) throw new RangeError('Unknown target space.');
  if (language === 'js')
    return `const values = [${values.join(', ')}];\nconst source = "${source}";\nconst target = "${target}";\nconst result = convertColor(values, source, target);\nconsole.log(result === null ? "Outside the bounded HSL/HSV model" : result);\n`;
  if (language === 'python')
    return `values = [${values.join(', ')}]\nsource = "${source}"\ntarget = "${target}"\nresult = convert_color(values, source, target)\nprint("Outside the bounded HSL/HSV model" if result is None else result)\n`;
  if (language === 'c')
    return `int main(void) {\n    const double values[3] = {${values.join(', ')}};\n    const ColorSpace source = ${source.toUpperCase()};\n    const ColorSpace target = ${target.toUpperCase()};\n    double result[3];\n    ColorStatus status = convert_color(values, source, target, result);\n    if (status != COLOR_OK) {\n        fprintf(stderr, "%s\\n", status == COLOR_OUT_OF_GAMUT\n            ? "Outside the bounded HSL/HSV model" : "Invalid input");\n        return 1;\n    }\n    printf("%.12g, %.12g, %.12g\\n", result[0], result[1], result[2]);\n    return 0;\n}\n`;
  throw new RangeError('Unknown language.');
}
