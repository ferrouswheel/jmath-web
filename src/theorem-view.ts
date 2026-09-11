import type { Theorem } from './types.ts';
import { theorems } from './theorems.ts';
const escape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
// Shared presentation for catalogue theorem entries. Content is authored locally.
export function renderTheorems<T extends { id: string; name: string }>(
  results: Theorem[],
  catalogue: T[],
  itemUrl: (item: T) => string,
) {
  return `<section class="related-theorems" id="theorems" aria-labelledby="theorems-heading"><h2 id="theorems-heading">Related theorems and identities</h2><p class="theorems-intro">Explore each result’s description, history, worked example, and proof on its own page.</p><div class="theorem-grid">${results
    .map((t) => {
      const document = theorems.find((entry) => entry.id === t.id);
      const links = document
        ? document.pages.slice(1)
        : t.related.map((id) => {
            const related = catalogue.find((s) => s.id === id)!;
            return { url: itemUrl(related), name: related.name };
          });
      return `<article class="theorem-card" id="theorem-${t.id}" aria-labelledby="title-${t.id}"><span class="theorem-kind">${escape(t.kind)}</span><h3 id="title-${t.id}"><a href="/theorems/${t.id}">${escape(t.title)}</a></h3><div class="theorem-conditions">${document?.html.conditions ?? `<p>${escape(t.conditions)}</p>`}</div><div class="theorem-statement">${document?.html.statement ?? `<p>${escape(t.statement)}</p>`}</div><a class="theorem-reference" href="/theorems/${t.id}">Read theorem and history →</a>${
        links.length
          ? `<div class="theorem-related">${links
              .map(
                (related) =>
                  `<a href="${related.url}#theorems">${escape(related.name)} →</a>`,
              )
              .join('')}</div>`
          : ''
      }</article>`;
    })
    .join('')}</div></section>`;
}
