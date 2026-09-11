import {
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, basename } from 'node:path';
import { parseDocument } from 'yaml';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { z } from 'zod';

marked.use(
  markedKatex({
    nonStandard: true,
    throwOnError: true,
    strict: 'error',
    trust: false,
    output: 'htmlAndMathml',
  }),
);

export const contentRoot = fileURLToPath(
  new URL('../src/content/', import.meta.url),
);
const generatedRoot = fileURLToPath(
  new URL('../src/generated/', import.meta.url),
);
const text = z.string().trim().min(1);
const reference = z
  .object({
    label: text,
    url: z
      .url()
      .refine((url) => url.startsWith('https://'), 'Use an HTTPS reference'),
  })
  .strict();
const page = z
  .string()
  .regex(/^(distributions|sequences|trigonometry)\/[a-z0-9-]+$/);
const parameter = z
  .object({
    key: text,
    label: text,
    symbol: text,
    value: z.number(),
    min: z.number(),
    max: z.number(),
    step: z.number().positive(),
    integer: z.boolean().optional(),
  })
  .strict()
  .refine(
    (p) => p.min <= p.value && p.value <= p.max,
    'Default must be within parameter bounds',
  )
  .refine(
    (p) =>
      !p.integer || [p.min, p.max, p.value, p.step].every(Number.isInteger),
    'Integer parameters require integer bounds, defaults, and steps',
  );
const distribution = z
  .object({
    id: z.string().regex(/^[a-z0-9_]+$/),
    name: text,
    alias: text,
    type: z.enum(['Continuous', 'Discrete']),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    notation: text,
    use: text,
    tags: z.array(text),
    formula: text,
    params: z.array(parameter).min(1),
    source: text.optional(),
    sourceUrl: z.url().optional(),
    constraints: z
      .array(
        z
          .object({
            left: text,
            right: text,
            op: z.enum(['<', '<=']),
            message: text,
          })
          .strict(),
      )
      .optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    const keys = d.params.map((p) => p.key);
    if (new Set(keys).size !== keys.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Parameter keys must be unique',
      });
    for (const c of d.constraints ?? [])
      if (!keys.includes(c.left) || !keys.includes(c.right))
        ctx.addIssue({
          code: 'custom',
          message: 'Constraint refers to an unknown parameter',
        });
  });
const theorem = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: text,
    kind: text,
    order: z.number().int().nonnegative(),
    owner: page,
    related: z.array(page),
    reference,
    historyReference: reference.optional(),
  })
  .strict();
const sectionKeys = {
  Description: 'description',
  Conditions: 'conditions',
  Statement: 'statement',
  History: 'history',
  'Worked example': 'example',
  'Proof sketch': 'proof',
};

export function parseContent(source, file, kind) {
  try {
    const match = source
      .replaceAll('\r\n', '\n')
      .match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) throw new Error('Expected YAML frontmatter enclosed by ---');
    const document = parseDocument(match[1]);
    if (document.errors.length)
      throw new Error(document.errors.map((e) => e.message).join('\n'));
    const data = (kind === 'distributions' ? distribution : theorem).parse(
      document.toJS(),
    );
    if (basename(file, '.md') !== data.id.replaceAll('_', '-'))
      throw new Error('Filename must match the canonical ID');
    if (kind === 'distributions')
      return { ...data, description: text.parse(match[2].trim()) };

    // Tokenise headings so fenced code examples cannot accidentally split sections.
    const sections = {};
    let current;
    for (const token of marked.lexer(match[2])) {
      if (token.type === 'heading' && token.depth === 2) {
        current = sectionKeys[token.text];
        if (!current) throw new Error(`Unknown section: ${token.text}`);
        if (current in sections)
          throw new Error(`Duplicate section: ${token.text}`);
        sections[current] = '';
      } else if (current) sections[current] += token.raw;
      else if (token.raw.trim())
        throw new Error('Place prose inside the named sections');
    }
    for (const [heading, key] of Object.entries(sectionKeys)) {
      if (!sections[key]?.trim())
        throw new Error(`Missing or empty section: ${heading}`);
      sections[key] = sections[key].trim();
    }
    if (new Set([data.owner, ...data.related]).size !== data.related.length + 1)
      throw new Error('Related pages must be unique and exclude the owner');
    return {
      ...data,
      ...sections,
      historyReference: data.historyReference ?? data.reference,
      html: Object.fromEntries(
        Object.entries(sections).map(([key, value]) => [
          key,
          marked.parse(value, { async: false }),
        ]),
      ),
    };
  } catch (error) {
    throw new Error(`${file}: ${error.message}`, { cause: error });
  }
}

export function loadContent(root = contentRoot) {
  const result = {};
  for (const kind of ['distributions', 'theorems']) {
    const directory = resolve(root, kind);
    const entries = readdirSync(directory)
      .filter((file) => file.endsWith('.md'))
      .sort()
      .map((file) => {
        const path = resolve(directory, file);
        return parseContent(readFileSync(path, 'utf8'), path, kind);
      });
    if (new Set(entries.map((entry) => entry.id)).size !== entries.length)
      throw new Error(`${kind}: Duplicate IDs`);
    if (!entries.length) throw new Error(`${kind}: No content found`);
    result[kind] = entries;
  }
  result.theorems.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  return result;
}

export function generateContent() {
  const content = loadContent();
  mkdirSync(generatedRoot, { recursive: true });
  const output = {
    ...content,
    'theorem-summaries': content.theorems.map(
      ({ html, description, history, historyReference, ...summary }) => summary,
    ),
    'distribution-prose': Object.fromEntries(
      content.distributions.map((d) => [
        d.id,
        marked.parse(d.description, { async: false }),
      ]),
    ),
  };
  for (const [kind, entries] of Object.entries(output)) {
    const path = resolve(generatedRoot, `${kind}.json`);
    const serialized = JSON.stringify(entries, null, 2) + '\n';
    if (!existsSync(path) || readFileSync(path, 'utf8') !== serialized)
      writeFileSync(path, serialized);
  }
  return content;
}

export function contentPlugin() {
  return {
    name: 'jmath-markdown-content',
    buildStart() {
      generateContent();
    },
    configureServer(server) {
      server.watcher.add(contentRoot);
      const changed = (file) => {
        if (!file.startsWith(contentRoot) || !file.endsWith('.md')) return;
        try {
          generateContent();
        } catch (error) {
          server.config.logger.error(error.message);
          server.ws.send({
            type: 'error',
            err: { message: error.message, stack: '' },
          });
        }
      };
      server.watcher
        .on('add', changed)
        .on('change', changed)
        .on('unlink', changed);
      server.httpServer?.once('close', () => {
        for (const event of ['add', 'change', 'unlink'])
          server.watcher.off(event, changed);
      });
    },
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const content = generateContent();
  console.log(
    `Validated ${content.distributions.length} distributions and ${content.theorems.length} theorems.`,
  );
}
