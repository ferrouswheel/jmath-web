import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadContent, parseContent } from '../scripts/content.mjs';
import { distributions } from '../src/distributions.ts';
import { curves } from '../src/curves.ts';
import { theorems } from '../src/theorems.ts';

const theoremFile = new URL(
  '../src/content/theorems/central-limit.md',
  import.meta.url,
);
const theorem = readFileSync(theoremFile, 'utf8');
const distributionFile = new URL(
  '../src/content/distributions/normal.md',
  import.meta.url,
);
const distribution = readFileSync(distributionFile, 'utf8');

test('every authored document is represented by a page or numerical implementation', () => {
  const content = loadContent();
  assert.deepEqual(
    content.distributions.map((d) => d.id).sort(),
    distributions.map((d) => d.id).sort(),
  );
  assert.deepEqual(
    content.theorems.map((t) => t.id),
    theorems.map((t) => t.id),
  );
  assert.deepEqual(
    content.curves.map((c) => c.id),
    curves.map((c) => c.id),
  );
  for (const c of content.curves) assert.match(c.html, /class="katex/);
  for (const t of theorems) {
    assert.equal(t.pages[0].url, `/${t.owner}`);
    assert.equal(t.pages.length, t.relatedPages.length + 1);
  }
});

test('Markdown supports rich prose and fenced code without confusing section headings', () => {
  const source = theorem.replace(
    '## History\n\n',
    '## History\n\n**Historical context** with [a link](https://example.com).\n\n- One\n- Two\n\n```text\n## Not a section\n```\n\n',
  );
  const entry = parseContent(source, 'central-limit.md', 'theorems');
  assert.match(entry.html.history, /<strong>Historical context<\/strong>/);
  assert.match(entry.html.history, /<ul>/);
  assert.match(entry.html.history, /<a href="https:\/\/example.com">/);
  assert.match(entry.html.history, /## Not a section/);
  assert.equal(
    entry.proof,
    theorems.find((t) => t.id === 'central-limit').proof,
  );
});

test('invalid authoring produces errors with filenames and actionable details', () => {
  const invalid = [
    [
      theorem.replace('id: central-limit', 'id: central-limit\nid: duplicate'),
      /central-limit.md:.*Map keys must be unique/s,
    ],
    [
      theorem.replace('## History', '## Background'),
      /Unknown section: Background/,
    ],
    [
      theorem.replace('## History', '## Statement'),
      /Duplicate section: Statement/,
    ],
    [
      theorem.replace(/## History[\s\S]*?(?=## Worked example)/, ''),
      /Missing or empty section: History/,
    ],
    [theorem.replace('owner: distributions/normal', 'owner: missing'), /owner/],
    [
      theorem.replace(
        '  - distributions/bernoulli',
        '  - distributions/normal',
      ),
      /exclude the owner/,
    ],
  ];
  for (const [source, error] of invalid)
    assert.throws(
      () => parseContent(source, 'central-limit.md', 'theorems'),
      error,
    );
  assert.throws(
    () => parseContent(theorem, 'wrong-id.md', 'theorems'),
    /Filename must match/,
  );
  assert.throws(
    () =>
      parseContent(
        distribution.replace('value: 0', 'value: 100'),
        'normal.md',
        'distributions',
      ),
    /Default must be within/,
  );
  assert.throws(
    () =>
      parseContent(
        distribution.replace('step: 0.1', 'step: 0'),
        'normal.md',
        'distributions',
      ),
    /step/,
  );
});

test('math is typeset at build time, remains accessible, and rejects invalid LaTeX', () => {
  const entry = parseContent(theorem, 'central-limit.md', 'theorems');
  assert.match(entry.html.statement, /class="katex-display"/);
  assert.match(entry.html.conditions, /class="katex"/);
  assert.match(entry.html.statement, /<math[ >]/);
  assert.match(entry.html.statement, /encoding="application\/x-tex"/);
  assert.throws(
    () =>
      parseContent(
        theorem.replace('\\xrightarrow', '\\unknownMathCommand'),
        'central-limit.md',
        'theorems',
      ),
    /central-limit.md:.*KaTeX parse error/s,
  );
  const code = parseContent(
    theorem.replace(
      '## History\n\n',
      '## History\n\n```js\nconst price = "$5";\n```\n\n',
    ),
    'central-limit.md',
    'theorems',
  );
  assert.match(code.html.history, /\$5/);
  assert.doesNotMatch(code.html.history, /class="katex"/);
});
