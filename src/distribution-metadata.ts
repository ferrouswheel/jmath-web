import entries from './generated/distributions.json' with { type: 'json' };
import type { Distribution } from './types.ts';

type Metadata = Omit<
  Distribution,
  'density' | 'cdf' | 'range' | 'stats' | 'sample' | 'exampleX' | 'plotKnots'
>;
const metadata = new Map(entries.map((entry) => [entry.id, entry as Metadata]));
export function distributionMetadata(id: string): Metadata {
  const entry = metadata.get(id);
  if (!entry)
    throw new Error(`Missing Markdown metadata for distribution ${id}`);
  return entry;
}
export function validateDistributionRegistry(distributions: Distribution[]) {
  const ids = new Set(distributions.map((d) => d.id));
  if (ids.size !== distributions.length)
    throw new Error('Duplicate numerical distribution implementation');
  for (const id of metadata.keys())
    if (!ids.has(id))
      throw new Error(`No numerical implementation for distribution ${id}`);
}
