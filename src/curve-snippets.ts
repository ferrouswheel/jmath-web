import { curveError, type Curve, type CurveState } from './curves.ts';
import { snippetFile } from './snippet-files/curves.ts';
export const curveLanguages = { js: 'JavaScript', python: 'Python', c: 'C' };
export function curveSnippet(
  curve: Curve,
  language: string,
  state: CurveState,
) {
  const error = curveError(curve, state);
  if (error) throw new RangeError(error);
  const source = snippetFile(curve.id, language);
  const parametric = curve.id === 'bezier';
  const args = parametric
    ? `${JSON.stringify(state.points)}, ${state.input}`
    : [state.input, ...state.coefficients].join(', ');
  if (language === 'js')
    return (
      source + `\nconsole.log(JSON.stringify(evaluate_${curve.id}(${args})));\n`
    );
  if (language === 'python')
    return (
      source +
      `\nimport json\nprint(json.dumps(evaluate_${curve.id}(${args})))\n`
    );
  if (parametric)
    return (
      source +
      `\nint main(void) {\n    Point points[] = { ${state.points.map((p) => `{${p.join(', ')}}`).join(', ')} };\n    BezierValue result;\n    if (!evaluate_bezier(points, ${state.points.length}, ${state.input}, &result)) return 1;\n    printf("{\\"point\\":[%.17g,%.17g],\\"derivative\\":[%.17g,%.17g]}\\n", result.point.x, result.point.y, result.derivative.x, result.derivative.y);\n    return 0;\n}\n`
    );
  return (
    source +
    `\nint main(void) {\n    CurveValue result;\n    if (!evaluate_${curve.id}(${args}, &result)) return 1;\n    printf("{\\"value\\":%.17g,\\"derivative\\":%.17g}\\n", result.value, result.derivative);\n    return 0;\n}\n`
  );
}
