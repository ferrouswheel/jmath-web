import type { TrigFunction } from './types.ts';
export function exactTable(item: TrigFunction) {
  const direct = [
    ['0', '0°', '0', '1', '0'],
    ['π/6', '30°', '1/2', '√3/2', '√3/3'],
    ['π/4', '45°', '√2/2', '√2/2', '1'],
    ['π/3', '60°', '√3/2', '1/2', '√3'],
    ['π/2', '90°', '1', '0', 'Undefined'],
    ['π', '180°', '0', '−1', '0'],
  ];
  const inverse: Record<string, string[][]> = {
    arcsin: [
      ['−1', '−π/2', '−90°'],
      ['−1/2', '−π/6', '−30°'],
      ['0', '0', '0°'],
      ['1/2', 'π/6', '30°'],
      ['1', 'π/2', '90°'],
    ],
    arccos: [
      ['−1', 'π', '180°'],
      ['−1/2', '2π/3', '120°'],
      ['0', 'π/2', '90°'],
      ['1/2', 'π/3', '60°'],
      ['1', '0', '0°'],
    ],
    arctan: [
      ['−√3', '−π/3', '−60°'],
      ['−1', '−π/4', '−45°'],
      ['0', '0', '0°'],
      ['1', 'π/4', '45°'],
      ['√3', 'π/3', '60°'],
    ],
  };
  const headings = item.inverse
      ? ['Input x', 'Angle (radians)', 'Angle (degrees)']
      : ['Radians', 'Degrees', 'sin', 'cos', 'tan'],
    rows = item.inverse ? inverse[item.id] : direct;
  return `<section class="trig-reference"><h2>Exact reference values</h2><div class="trig-table-wrap"><table><thead><tr>${headings.map((s) => `<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((s) => `<td>${s}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
