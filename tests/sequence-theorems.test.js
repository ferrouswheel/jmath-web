import test from 'node:test';
import assert from 'node:assert/strict';
import { sequences, fibonacci } from '../src/sequences.ts';
import { sequenceTheorems } from '../src/sequence-theorems.ts';
test('theorem references and related sequence links are complete', () => {
  for (const sequence of sequences) {
    const ids = new Set();
    for (const t of sequenceTheorems[sequence.id]) {
      assert.ok(!ids.has(t.id));
      ids.add(t.id);
      for (const key of [
        'title',
        'kind',
        'conditions',
        'statement',
        'example',
        'proof',
      ])
        assert.ok(t[key].length > 0);
      assert.equal(new URL(t.reference.url).protocol, 'https:');
      for (const id of t.related) assert.ok(sequences.some((s) => s.id === id));
    }
  }
});
test('stated sum identities hold at zero and across positive indices', () => {
  let squares = 0n,
    cubes = 0n,
    hexagons = 0n,
    fibSquares = 0n;
  for (let i = 0; i <= 1000; i++) {
    const n = BigInt(i),
      triangle = (n * (n + 1n)) / 2n;
    squares += n * n;
    cubes += n ** 3n;
    hexagons += n * (2n * n - 1n);
    fibSquares += fibonacci(i) ** 2n;
    assert.equal(squares, (n * (n + 1n) * (2n * n + 1n)) / 6n);
    assert.equal(cubes, triangle ** 2n);
    assert.equal(hexagons, (n * (n + 1n) * (4n * n - 1n)) / 6n);
    assert.equal(fibSquares, fibonacci(i) * fibonacci(i + 1));
  }
});
test('polygonal recognition conditions reject false positives', () => {
  const triangular = new Set(),
    pentagonal = new Set();
  for (let n = 0; n <= 1000; n++) {
    triangular.add((n * (n + 1)) / 2);
    pentagonal.add((n * (3 * n - 1)) / 2);
  }
  for (let m = 0; m <= 10000; m++) {
    const t = Math.sqrt(8 * m + 1),
      p = Math.sqrt(24 * m + 1);
    assert.equal(Number.isInteger(t) && t % 2 === 1, triangular.has(m));
    assert.equal(
      m === 0 || (Number.isInteger(p) && p % 6 === 5),
      pentagonal.has(m),
    );
  }
  assert.equal(59 * 509, 30031);
  for (let m = -100; m <= 100; m++)
    assert.ok([0, 1, 8].includes(((m ** 3 % 9) + 9) % 9));
});
