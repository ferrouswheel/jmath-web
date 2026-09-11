export type Parameters = Record<string, number>;
export type RandomSource = () => number;
export interface Parameter {
  key: string;
  label: string;
  symbol: string;
  value: number;
  min: number;
  max: number;
  step: number;
  integer?: boolean;
}
export interface Distribution {
  id: string;
  name: string;
  alias: string;
  description: string;
  type: 'Continuous' | 'Discrete';
  color: string;
  notation: string;
  tags: string[];
  use: string;
  params: Parameter[];
  density: (x: number, p: Parameters) => number;
  cdf: (x: number, p: Parameters) => number;
  range: (p: Parameters) => number[];
  stats: (p: Parameters) => Record<string, number | string>;
  sample: (p: Parameters, rng: RandomSource) => number;
  formula: string;
  source?: string;
  sourceUrl?: string;
  exampleX?: (p: Parameters) => number;
  plotKnots?: (p: Parameters) => number[];
  constraints?: { left: string; right: string; op: string; message: string }[];
}
export interface Sequence {
  id: string;
  name: string;
  short: string;
  category: string;
  color: string;
  min: number;
  initial: number;
  visualMax: number;
  oeis: string;
  description: string;
  formula: string;
  recurrence: string;
  nth: (n: number) => bigint;
  explain: (n: number) => string[];
  insight: string;
  related: string[];
}
export interface Theorem {
  id: string;
  title: string;
  kind: string;
  conditions: string;
  statement: string;
  example: string;
  proof: string;
  related: string[];
  reference: { label: string; url: string };
}
export interface TrigFunction {
  id: string;
  name: string;
  notation: string;
  description: string;
  inverse: boolean;
  fn: (x: number) => number;
  initial: number;
  domain: string;
  range: string;
  period: string;
  parity: string;
  derivative: string;
  formula: string;
  explanation: string;
  graph: number[];
  related: string[];
  theorems: Theorem[];
}
export interface AdjustmentSettings {
  gain: number;
  exposure: number;
  contrast: number;
  brightness: number;
  gamma: number;
  space: string;
}
export type AdjustmentKey = Exclude<keyof AdjustmentSettings, 'space'>;
export type Language = 'js' | 'python' | 'c';
