import type { Theorem } from './types.ts';
// Shared presentation for catalogue theorem entries. Content is authored locally.
export function renderTheorems<T extends { id: string; name: string }>(
  results: Theorem[],
  catalogue: T[],
  itemUrl: (item: T) => string,
) {
  return `<section class="related-theorems" id="theorems" aria-labelledby="theorems-heading"><h2 id="theorems-heading">Related theorems and identities</h2><p class="theorems-intro">Statements, conditions, and proof sketches. Examples use fixed values, independent of the calculator.</p><div class="theorem-grid">${results
    .map(
      (t) =>
        `<article class="theorem-card" id="theorem-${t.id}" aria-labelledby="title-${t.id}"><span class="theorem-kind">${t.kind}</span><h3 id="title-${t.id}"><a href="#theorem-${t.id}">${t.title}</a></h3><p class="theorem-conditions">${t.conditions}</p><p class="theorem-statement">${t.statement}</p><h4>Example</h4><p>${t.example}</p><details><summary>Proof sketch</summary><p>${t.proof}</p></details><a class="theorem-reference" href="${t.reference.url}" target="_blank" rel="noreferrer">${t.reference.label} ↗</a>${
          t.related.length
            ? `<div class="theorem-related">${t.related
                .map((id: string) => {
                  const related = catalogue.find((s) => s.id === id)!;
                  return `<a href="${itemUrl(related)}#theorems">${related.name} →</a>`;
                })
                .join('')}</div>`
            : ''
        }</article>`,
    )
    .join('')}</div></section>`;
}
