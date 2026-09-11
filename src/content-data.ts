import entries from './generated/theorem-summaries.json' with { type: 'json' };
import type { Theorem } from './types.ts';

export interface TheoremDocument extends Theorem {
  owner: string;
  relatedPages: string[];
  order: number;
  description: string;
  history: string;
  historyReference: Theorem['reference'];
  html: Record<
    | 'description'
    | 'conditions'
    | 'statement'
    | 'history'
    | 'example'
    | 'proof',
    string
  >;
}
export const theoremEntries = entries.map((entry) => ({
  ...entry,
  relatedPages: entry.related,
  // Compatibility for existing explorer cards and numerical tests.
  related: entry.related.map((page) =>
    page.startsWith('distributions/')
      ? page.split('/')[1].replaceAll('-', '_')
      : page.split('/')[1],
  ),
}));
export const theoremsFor = (owner: string) =>
  theoremEntries.filter((entry) => entry.owner === owner);
export function theoremGroup(section: string): Record<string, Theorem[]> {
  return Object.fromEntries(
    [
      ...new Set(
        theoremEntries
          .filter((t) => t.owner.startsWith(`${section}/`))
          .map((t) => t.owner),
      ),
    ].map((owner) => [
      section === 'distributions'
        ? owner.split('/')[1].replaceAll('-', '_')
        : owner.split('/')[1],
      theoremsFor(owner),
    ]),
  );
}
