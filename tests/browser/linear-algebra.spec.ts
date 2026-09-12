import { test, expect, type Page } from '@playwright/test';
import { operationPages } from '../../src/algebra-operations';

async function dragTo(page: Page, handle: string, x: number, y: number) {
  const target = page.locator(`[data-handle="${handle}"]`).first();
  await target.scrollIntoViewIfNeeded();
  const points = await target.evaluate(
    (node, dest) => {
      const circle = node as SVGCircleElement,
        svg = circle.ownerSVGElement!;
      const matrix = svg.getScreenCTM()!,
        unit = Number(svg.dataset.unit);
      const start = new DOMPoint(
        Number(circle.getAttribute('cx')),
        Number(circle.getAttribute('cy')),
      ).matrixTransform(matrix);
      const end = new DOMPoint(
        260 + dest[0] * unit,
        200 - dest[1] * unit,
      ).matrixTransform(matrix);
      return { start: { x: start.x, y: start.y }, end: { x: end.x, y: end.y } };
    },
    [x, y],
  );
  await page.mouse.move(points.start.x, points.start.y);
  await page.mouse.down();
  await page.mouse.move(points.end.x, points.end.y, { steps: 8 });
  await page.mouse.up();
}

test('landing pages explain meaning and link to dedicated operations', async ({
  page,
}) => {
  for (const section of ['/vectors', '/matrices']) {
    await page.goto(section);
    await expect(page.locator('.la-meaning')).toBeVisible();
    await expect(page.locator('.la-meaning-cards article')).toHaveCount(3);
    await expect(page.locator('#la-controls')).toHaveCount(0);
    for (const operation of operationPages.filter(
      (p) => p.section === section,
    )) {
      await expect(
        page.locator(`.la-operation-grid a[href="${operation.path}"]`),
      ).toBeVisible();
    }
  }
});

test('every operation has focused server-rendered content and code', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const topic of operationPages) {
    expect((await page.goto(topic.path))?.status(), topic.path).toBe(200);
    await expect(page.locator('h1')).toHaveText(topic.title);
    await expect(page.locator('.la-interpretation')).toContainText(
      topic.interpretation,
    );
    await expect(page.locator('#la-operation')).toHaveCount(0);
    await expect(page.locator('#la-code')).toContainText('import numpy as np');
    await expect(page.locator('#la-results .katex').first()).toBeVisible();
    await expect(page.locator('#la-visual svg').first()).toBeVisible();
  }
  await context.close();
});

test('dragging vector inputs updates coordinates, math, and code; keyboard and reset work', async ({
  page,
}) => {
  await page.goto('/vectors/addition');
  await dragTo(page, 'u', 3, -1);
  expect(
    Number(await page.locator('[data-group="u"][data-index="0"]').inputValue()),
  ).toBeCloseTo(3, 1);
  expect(
    Number(await page.locator('[data-group="u"][data-index="1"]').inputValue()),
  ).toBeCloseTo(-1, 1);
  await expect(page.locator('#la-status')).toContainText('u = (3, -1)');
  await expect(page.locator('#la-code')).toContainText('[3,-1]');
  await page.locator('[data-handle="u"]').press('ArrowRight');
  await expect(page.locator('[data-group="u"][data-index="0"]')).toHaveValue(
    '3.1',
  );
  await page.locator('[data-group="u"][data-index="0"]').fill('');
  await expect(page.locator('#la-error')).toContainText('last valid inputs');
  await expect(page.locator('#la-code')).toContainText('[3.1,-1]');
  await page.locator('#la-reset').click();
  await expect(page.locator('#la-error')).toBeEmpty();
  await expect(page.locator('[data-group="u"][data-index="0"]')).toHaveValue(
    '2',
  );
  await page
    .getByRole('button', { name: 'Perpendicular', exact: true })
    .click();
  await expect(page.locator('#la-results h3')).toHaveText('Addition');
});

test('matrix columns can be dragged; each operation keeps only relevant controls', async ({
  page,
}) => {
  await page.goto('/matrices/determinants');
  await dragTo(page, 'a0', 3, 0);
  await expect(page.locator('[data-group="a"][data-index="0"]')).toHaveValue(
    '3',
  );
  await expect(page.locator('#la-status')).toContainText('Determinant 3');
  await page.goto('/matrices/inverse');
  await expect(page.locator('[data-group="b"]')).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Singular matrix', exact: true })
    .click();
  await expect(page.locator('#la-status')).toContainText('no inverse');
  await page.goto('/vectors/magnitude');
  await expect(page.locator('[data-group="v"]')).toHaveCount(0);
  await expect(page.locator('#la-results h3')).toHaveText('Length of u');
  await page.goto('/vectors/projection');
  await page.locator('[data-group="v"][data-index="0"]').fill('0');
  await page.locator('[data-group="v"][data-index="1"]').fill('0');
  await expect(page.locator('#la-results')).toContainText('Undefined');
});

test('all operations and presets fit mobile and code languages stay live', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  for (const topic of operationPages) {
    await page.goto(topic.path);
    for (const button of await page.locator('[data-preset]').all()) {
      await button.click();
      await expect(page.locator('#la-error')).toBeEmpty();
      await expect(page.locator('#la-code')).not.toContainText('= undefined');
      expect(await page.locator('#la-visual').innerHTML()).not.toMatch(
        /NaN|Infinity/,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        topic.path,
      ).toBe(true);
    }
    await page.locator('[data-la-language="js"]').click();
    await expect(page.locator('#la-code')).toContainText('console.log(result)');
    await page.locator('#la-copy-code').click();
    await expect(page.locator('#la-copy-status')).toHaveText('Copied.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await page.locator('#la-code').textContent(),
    );
  }
  await page.goto('/matrices/jacobians');
  await page.locator('[data-scalar="delta"]').fill('0.01');
  await expect(page.locator('#la-code')).toContainText('[0.01, 0.01]');
  await page.goto('/eigenvalues');
  await page.getByRole('button', { name: 'Rotation · complex' }).click();
  await expect(page.locator('#la-results')).toContainText(
    'no real eigenvectors',
  );
  expect(errors).toEqual([]);
});

test('touch dragging uses the same coordinates without scrolling the page', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/vectors/addition');
  const handle = page.locator('[data-handle="u"]');
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  const x = box!.x + box!.width / 2,
    y = box!.y + box!.height / 2;
  const client = await context.newCDPSession(page);
  const scroll = await page.evaluate(() => scrollY);
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: x + 25, y: y - 15 }],
  });
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  expect(
    Number(await page.locator('[data-group="u"][data-index="0"]').inputValue()),
  ).toBeGreaterThan(2);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(scroll, 0);
  await context.close();
});
