import { test, expect } from '@playwright/test';
import {
  curves,
  initialCurveState,
  polynomial,
  curveFormat,
} from '../../src/curves';
import { curvePlot } from '../../src/curve-visuals';

test('polynomial evaluation points drag horizontally and clamp to the x window', async ({
  page,
}) => {
  for (const curve of curves.filter((c) => c.id !== 'bezier')) {
    await page.goto(`/curves/${curve.id}`);
    const handle = page.locator('[data-evaluation]');
    await handle.scrollIntoViewIfNeeded();
    const equation = await page
      .locator('#curve-equation annotation')
      .textContent();
    const target = await page
      .locator('#curve-graph svg')
      .evaluate((node, plot) => {
        const svg = node as SVGSVGElement,
          matrix = svg.getScreenCTM()!;
        const at = (x: number, y: number) => {
          const point = new DOMPoint(
            plot.left + ((x + 5) / 10) * (plot.width - plot.left - plot.right),
            y,
          ).matrixTransform(matrix);
          return { x: point.x, y: point.y };
        };
        return {
          selected: at(2.25, 180),
          beyond: at(8, 180),
          click: at(-2, 180),
        };
      }, curvePlot);
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(target.selected.x, target.selected.y, { steps: 6 });
    await expect(page.locator('#curve-input')).toHaveValue('2.25');
    await expect(page.locator('#curve-position')).toHaveValue('2.25');
    const y = polynomial(initialCurveState(curve).coefficients, 2.25).value;
    await expect(page.locator('#curve-point')).toHaveText(
      `(2.25, ${curveFormat(y)})`,
    );
    await expect(page.locator('#curve-equation annotation')).toHaveText(
      equation!,
    );
    expect(new URL(page.url()).searchParams.get('x')).toBe('2.25');
    await page.mouse.move(target.beyond.x, target.beyond.y);
    await page.mouse.up();
    await expect(page.locator('#curve-input')).toHaveValue('5');
    await page.mouse.click(target.click.x, target.click.y);
    await expect(page.locator('#curve-input')).toHaveValue('-2');
    await handle.press('ArrowRight');
    await expect(page.locator('#curve-input')).toHaveValue('-1.9');
    await handle.press('Home');
    await expect(page.locator('#curve-input')).toHaveValue('-5');
    await handle.press('End');
    await expect(page.locator('#curve-input')).toHaveValue('5');
    await page.reload();
    await expect(page.locator('#curve-input')).toHaveValue('5');
    await expect(page.locator('#curve-error')).toBeEmpty();
  }
});

test('touch can drag the selected x without scrolling', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('/curves/quadratic');
  const handle = page.locator('[data-evaluation]');
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  const scroll = await page.evaluate(() => scrollY);
  const client = await context.newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  });
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: x + 30, y: y - 15 }],
  });
  await client.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  expect(
    Number(await page.locator('#curve-input').inputValue()),
  ).toBeGreaterThan(1);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(scroll, 0);
  await expect(page.locator('#curve-error')).toBeEmpty();
  await context.close();
});
