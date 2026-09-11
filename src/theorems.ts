import { distributions } from './distributions.ts';
import { sequences, sequenceUrl } from './sequences.ts';
import { trigFunctions, trigUrl } from './trigonometry.ts';
import { distributionUrl } from './routes.ts';
import { curves, curveUrl } from './curves.ts';
import { theoremEntries, type TheoremDocument } from './content-data.ts';
import documents from './generated/theorems.json' with { type: 'json' };
const theoremDocuments: TheoremDocument[] = documents.map((document) => ({
  ...document,
  relatedPages: document.related,
  related: theoremEntries.find((entry) => entry.id === document.id)!.related,
}));

export const theoremUrl = (theorem: { id: string }) =>
  `/theorems/${theorem.id}`;
export interface TheoremPage extends TheoremDocument {
  sectionName: string;
  pages: { name: string; url: string }[];
}
const pages = [
  ...curves.map((c) => ({ name: c.name, url: curveUrl(c), section: 'Curves' })),
  ...distributions.map((d) => ({
    name: d.name,
    url: distributionUrl(d),
    section: 'Distributions',
  })),
  ...sequences.map((s) => ({
    name: s.name,
    url: sequenceUrl(s),
    section: 'Sequences',
  })),
  ...trigFunctions.map((t) => ({
    name: t.name,
    url: trigUrl(t),
    section: 'Trigonometry',
  })),
];
export const theorems: TheoremPage[] = theoremDocuments.map((document) => {
  const related = [document.owner, ...document.relatedPages].map((id) => {
    const page = pages.find((p) => p.url === `/${id}`);
    if (!page) throw new Error(`${document.id}: unknown related page ${id}`);
    return page;
  });
  return { ...document, sectionName: related[0].section, pages: related };
});
