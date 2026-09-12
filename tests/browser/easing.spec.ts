import { test, expect } from '@playwright/test';
import { easings, easingUrl } from '../../src/easings';

test('curve formulas precede the entire workspace on desktop and mobile', async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const id of ['linear', 'quadratic', 'cubic', 'bezier']) {
      await page.goto(`/curves/${id}`);
      const formula = (await page
          .locator('.curve-equation-top')
          .boundingBox())!,
        workspace = (await page.locator('.curve-workspace').boundingBox())!;
      expect(formula.y + formula.height).toBeLessThanOrEqual(workspace.y);
      await expect(page.locator('#curve-equation .katex')).toBeVisible();
    }
  }
});
test('easing landing and all 31 formulas render without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false }),
    page = await context.newPage();
  await page.goto('/easing');
  await expect(page.locator('.easing-card')).toHaveCount(11);
  for (const e of easings) {
    expect((await page.goto(easingUrl(e)))?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText(e.name);
    await expect(page.locator('.easing-formula .katex').first()).toBeVisible();
    await expect(page.locator('#easing-graph svg')).toBeVisible();
    await expect(page.locator('#easing-code')).toContainText(
      'function ease(t)',
    );
  }
  await context.close();
});
test('scrubbing, value edits, playback, validation, and code copying stay synchronized', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/easing/quadratic-in');
  await page.locator('#easing-t').fill('0.5');
  await expect(page.locator('#easing-results output').nth(1)).toHaveText(
    '0.25',
  );
  await page.locator('[data-easing-input="start"]').fill('10');
  await page.locator('[data-easing-input="end"]').fill('50');
  await expect(page.locator('#easing-results output').nth(2)).toHaveText('20');
  await page.locator('#easing-t').fill('2');
  await expect(page.locator('#easing-error')).toContainText('last valid');
  await expect(page.locator('#easing-play')).toBeDisabled();
  await expect(page.locator('#easing-t')).toHaveValue('2');
  await page.locator('#easing-t').fill('0.5');
  await page.locator('[data-easing-input="duration"]').fill('0.2');
  await page.locator('#easing-play').click();
  await expect(page.locator('#easing-play')).toHaveText('Replay');
  await expect(page.locator('#easing-results output').nth(2)).toHaveText('50');
  await page.locator('#easing-reset').click();
  await expect(page.locator('#easing-play')).toHaveText('Play');
  await expect(page.locator('#easing-t')).toHaveValue('0.35');
  await page.locator('[data-easing-language="python"]').click();
  await expect(page.locator('#easing-code')).toContainText('def ease(t)');
  await page.locator('#easing-copy').click();
  await expect(page.locator('#easing-copy-status')).toHaveText('Copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await page.locator('#easing-code').textContent(),
  );
  await page.locator('[data-easing-handle]').press('End');
  await expect(page.locator('#easing-t')).toHaveValue('1');
});
test('graphs can be dragged and every easing fits mobile without autoplay', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const e of easings) {
    await page.goto(easingUrl(e));
    await expect(page.locator('#easing-play')).toHaveText('Play');
    await expect(page.locator('#easing-t')).toHaveValue('0.35');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      e.id,
    ).toBe(true);
  }
  await page.goto('/easing/elastic-out');
  const graph = page.locator('#easing-graph svg');
  await graph.scrollIntoViewIfNeeded();
  const target = await graph.evaluate((node) => {
    const matrix = (node as SVGSVGElement).getScreenCTM()!;
    const p = new DOMPoint(62 + 0.7 * (640 - 62 - 24), 180).matrixTransform(
      matrix,
    );
    return { x: p.x, y: p.y };
  });
  await page.mouse.move(target.x - 20, target.y);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('#easing-t')).toHaveValue('0.7');
  expect(errors).toEqual([]);
});

test('derivative overlays toggle independently and rates track time, duration and playback', async ({
  page,
}) => {
  await page.goto('/easing/quadratic-in');
  const rates = page.locator('#easing-derivative-results output');
  await page.locator('#easing-t').fill('0.5');
  await expect(rates).toHaveText(['50', '50']);
  await expect(page.locator('[data-easing-overlay]')).toHaveCount(0);
  await page.locator('#easing-show-velocity').check();
  await expect(page.locator('[data-easing-overlay="velocity"]')).toBeVisible();
  await page.locator('#easing-show-acceleration').check();
  await expect(page.locator('[data-easing-overlay]')).toHaveCount(2);
  await expect(page.locator('#easing-overlay-note')).toBeVisible();
  await page.locator('[data-easing-input="duration"]').fill('4');
  await expect(rates).toHaveText(['25', '12.5']);
  await page.locator('[data-easing-input="end"]').fill('-100');
  await expect(rates).toHaveText(['-25', '-12.5']);
  await page.locator('[data-easing-handle]').press('ArrowRight');
  await expect(rates.nth(0)).toHaveText('-25.5');
  await expect(page.locator('#easing-code')).toContainText(
    'function velocityAt(t)',
  );
  await page.locator('[data-easing-language="python"]').click();
  await expect(page.locator('#easing-code')).toContainText(
    'def acceleration_at(t)',
  );
  await page.locator('#easing-show-velocity').uncheck();
  await expect(page.locator('[data-easing-overlay="velocity"]')).toHaveCount(0);
  await expect(
    page.locator('[data-easing-overlay="acceleration"]'),
  ).toHaveAttribute('d', /^M/);
  await page.locator('[data-easing-input="duration"]').fill('0.2');
  await page.locator('#easing-play').click();
  await expect(page.locator('#easing-play')).toHaveText('Replay');
  await expect(rates).toHaveText(['-1000', '-5000']);
  await page.locator('#easing-show-acceleration').uncheck();
  await expect(page.locator('#easing-overlay-note')).toBeHidden();
});

test('derivative overlays fit mobile and identify undefined or unbounded values', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [id, t, expected] of [
    ['quadratic-in-out', '0.5', ['100', 'Undefined']],
    ['bounce-out', String(4 / 11), ['Undefined', 'Undefined']],
    ['circular-in', '1', ['∞', '∞']],
    ['exponential-in', '0', ['Undefined', 'Undefined']],
  ] as const) {
    await page.goto(`/easing/${id}`);
    await page.locator('#easing-show-velocity').check();
    await page.locator('#easing-show-acceleration').check();
    await page.locator('#easing-t').fill(t);
    await expect(
      page.locator('#easing-derivative-results output').nth(0),
    ).toHaveText(expected[0]);
    await expect(
      page.locator('#easing-derivative-results output').nth(1),
    ).toHaveText(expected[1]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(await page.locator('#easing-graph').innerHTML()).not.toMatch(
      /NaN|Infinity/,
    );
  }
});

test('actual and normalised modes keep axes, overlays and readouts consistent', async ({
  page,
}) => {
  await page.goto('/easing/quadratic-in');
  await page.locator('#easing-t').fill('0.5');
  await page.locator('[data-easing-input="start"]').fill('10');
  await page.locator('[data-easing-input="end"]').fill('50');
  await page.locator('[data-easing-input="duration"]').fill('4');
  await page.locator('#easing-show-velocity').check();
  await page.locator('#easing-show-acceleration').check();
  const ticks = page.locator('[data-easing-value-tick]');
  const rates = page.locator('#easing-derivative-results output');
  expect(await ticks.allTextContents()).toEqual(['10', '20', '30', '40', '50']);
  await expect(page.locator('[data-easing-time-tick]').last()).toHaveText('4');
  await expect(rates).toHaveText(['10', '5']);
  await expect(page.locator('#easing-results output').first()).toHaveText('2');
  await expect(page.locator('[data-easing-handle]')).toHaveAttribute(
    'aria-valuetext',
    '2 seconds; value 20',
  );
  const actualOverlay = await page
    .locator('[data-easing-overlay="velocity"]')
    .getAttribute('d');
  await page.getByRole('button', { name: 'Normalised', exact: true }).click();
  await expect(page.locator('[data-easing-mode="normalized"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await ticks.allTextContents()).toEqual([
    '0',
    '0.2',
    '0.4',
    '0.6',
    '0.8',
    '1',
  ]);
  await expect(page.locator('[data-easing-time-tick]').last()).toHaveText('1');
  await expect(rates).toHaveText(['1', '2']);
  await expect(page.locator('#easing-results output').first()).toHaveText(
    '0.5',
  );
  await expect(page.locator('#easing-velocity-label')).toHaveText(
    'Velocity E′(t)',
  );
  expect(
    await page.locator('[data-easing-overlay="velocity"]').getAttribute('d'),
  ).not.toBe(actualOverlay);
  const normalizedPath = await page
    .locator('.easing-svg .curve-path')
    .getAttribute('points');
  await page.locator('[data-easing-input="end"]').fill('-30');
  await expect(rates).toHaveText(['1', '2']);
  await expect(page.locator('.easing-svg .curve-path')).toHaveAttribute(
    'points',
    normalizedPath!,
  );
  await page
    .getByRole('button', { name: 'Actual values', exact: true })
    .click();
  await expect(rates).toHaveText(['-10', '-5']);
  const startY = Number(
    await page.locator('[data-easing-start]').getAttribute('cy'),
  );
  const endY = Number(
    await page.locator('[data-easing-end]').getAttribute('cy'),
  );
  expect(endY).toBeGreaterThan(startY);
  await page.locator('[data-easing-input="end"]').fill('10');
  await expect(rates).toHaveText(['0', '0']);
  expect(await page.locator('[data-easing-start]').getAttribute('cy')).toBe(
    await page.locator('[data-easing-end]').getAttribute('cy'),
  );
  await page.locator('[data-easing-handle]').press('ArrowRight');
  await expect(page.locator('#easing-t')).toHaveValue('0.51');
  await page.getByRole('button', { name: 'Normalised', exact: true }).click();
  await expect(rates).toHaveText(['1.02', '2']);
  await expect(page.locator('#easing-t')).toHaveValue('0.51');
  await expect(page.locator('[data-easing-input="duration"]')).toHaveValue('4');
  await expect(page.locator('[data-easing-overlay]')).toHaveCount(2);
  await page.locator('#easing-reset').click();
  await expect(page.locator('[data-easing-mode="normalized"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(rates).toHaveText(['0.7', '2']);
});
