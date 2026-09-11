import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { snippetFile as distributions } from '../src/snippet-files/distributions.ts';
import { snippetFile as sequences } from '../src/snippet-files/sequences.ts';
import { snippetFile as trigonometry } from '../src/snippet-files/trigonometry.ts';
import { snippetFile as color } from '../src/snippet-files/color.ts';

// Fail when a required runtime/compiler is missing: snippets are part of the product.
test('all standalone snippet files parse or compile and are displayed verbatim', () => {
  let count = 0;
  for (const [group, displaySource] of Object.entries({
    distributions,
    sequences,
    trigonometry,
    color,
  })) {
    const directory = new URL(`../snippets/${group}/`, import.meta.url);
    for (const name of readdirSync(directory)) {
      const file = fileURLToPath(new URL(name, directory));
      const [id, extension] = name.split('.');
      const language = extension === 'py' ? 'python' : extension;
      const source = readFileSync(file, 'utf8');
      assert.equal(
        displaySource(id, language),
        source,
        `${group}/${name} differs from displayed source`,
      );
      if (extension === 'js') execFileSync(process.execPath, ['--check', file]);
      else if (extension === 'py')
        execFileSync('python3', [
          '-c',
          'import ast, pathlib, sys; ast.parse(pathlib.Path(sys.argv[1]).read_text(), filename=sys.argv[1])',
          file,
        ]);
      else if (extension === 'c')
        execFileSync('cc', [
          '-std=c99',
          '-Wall',
          '-Wextra',
          '-Werror',
          '-fsyntax-only',
          file,
        ]);
      else assert.fail(`Unexpected snippet extension: ${name}`);
      count++;
    }
  }
  assert.equal(count, 102);
});
