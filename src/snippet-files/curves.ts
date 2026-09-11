import linear_js from '../../snippets/curves/linear.js?raw';
import linear_python from '../../snippets/curves/linear.py?raw';
import linear_c from '../../snippets/curves/linear.c?raw';
import quadratic_js from '../../snippets/curves/quadratic.js?raw';
import quadratic_python from '../../snippets/curves/quadratic.py?raw';
import quadratic_c from '../../snippets/curves/quadratic.c?raw';
import cubic_js from '../../snippets/curves/cubic.js?raw';
import cubic_python from '../../snippets/curves/cubic.py?raw';
import cubic_c from '../../snippets/curves/cubic.c?raw';
import bezier_js from '../../snippets/curves/bezier.js?raw';
import bezier_python from '../../snippets/curves/bezier.py?raw';
import bezier_c from '../../snippets/curves/bezier.c?raw';
const sources: Record<string, Record<string, string>> = {
  linear: { js: linear_js, python: linear_python, c: linear_c },
  quadratic: { js: quadratic_js, python: quadratic_python, c: quadratic_c },
  cubic: { js: cubic_js, python: cubic_python, c: cubic_c },
  bezier: { js: bezier_js, python: bezier_python, c: bezier_c },
};
export function snippetFile(id: string, language: string) {
  const source = sources[id]?.[language];
  if (!source) throw new RangeError('Unknown curve or language.');
  return source;
}
