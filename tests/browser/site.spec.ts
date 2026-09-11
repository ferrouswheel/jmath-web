import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { distributions } from '../../src/distributions';
import { sequences } from '../../src/sequences';
import { trigFunctions } from '../../src/trigonometry';

const routes = [
  '/',
  ...distributions.map((d) => '/distributions/' + d.id.replaceAll('_', '-')),
  '/sequences',
  ...sequences.map((s) => '/sequences/' + s.id),
  '/trigonometry',
  ...trigFunctions.map((t) => '/trigonometry/' + t.id),
  '/random-tools',
  '/random-tools/dice',
  '/random-tools/coins',
  '/color-math',
  '/color-math/converter',
  '/color-math/image',
];
test('every route renders real reference HTML without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of routes) {
    expect(
      (await page.goto('http://127.0.0.1:5180' + route))?.status(),
      route,
    ).toBe(200);
    await expect(page.locator('h1'), route).toBeVisible();
    if (route.startsWith('/trigonometry/')) {
      await expect(page.locator('.trig-function-nav a')).toHaveCount(6);
      await expect(
        page.locator('.trig-function-nav [aria-current=page]'),
      ).toHaveCount(1);
    }
    expect(await page.locator('main').innerText()).not.toMatch(
      /<a href=|aria-current=/,
    );
    if (/^\/(distributions|sequences|trigonometry)\/.+/.test(route)) {
      await expect(page.locator('#theorems .theorem-card')).toHaveCount(2);
      await expect(page.locator('.code-source code').first()).not.toBeEmpty();
      await expect(page.locator('main svg').first()).toBeVisible();
    }
  }
  await page.goto('http://127.0.0.1:5180/sequences');
  await expect(page.locator('.sequence-card')).toHaveCount(8);
  await page.goto('http://127.0.0.1:5180/color-math/converter');
  await expect(page.locator('#color-converted')).not.toBeEmpty();
  expect(
    (await page.goto('http://127.0.0.1:5180/missing-page'))?.status(),
  ).toBe(404);
  await context.close();
});
test('calculators, generators, simulations and browser history', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('#search').fill('poisson');
  await expect(page.locator('.distribution-card:visible')).toHaveCount(1);
  await page.locator('.distribution-card:visible').click();
  await page.locator('#number-rate').fill('12');
  await expect(page.locator('#stats')).toContainText('12');
  await page.locator('#sample-size').fill('20');
  await page.locator('#generate-form button[type=submit]').click();
  await expect(page.locator('#download')).toBeEnabled();
  await page.locator('#reset').click();
  await expect(page.locator('#number-rate')).toHaveValue('5');
  await expect(page.locator('#download')).toBeDisabled();
  await page.goBack();
  await expect(page.locator('#search')).toHaveValue('poisson');
  await page.goto('/sequences/fibonacci?n=100');
  await expect(page.locator('#nth-value')).toHaveText('354224848179261915075');
  await expect(page.locator('#sequence-n')).toHaveValue('100');
  await page.locator('#sequence-n').fill('10');
  await expect(page.locator('#nth-value')).toHaveText('55');
  await page.goto('/trigonometry/sin?x=30&unit=degrees');
  await expect(page.locator('#trig-result')).toHaveText('0.5');
  for (const tool of ['dice', 'coins']) {
    await page.goto('/random-tools/' + tool);
    await page.locator('#simulation-n').fill('100');
    await page.locator('#simulate').click();
    await expect(page.locator('#export-experiment')).toBeEnabled();
    await expect(page.locator('#experiment-stats')).toContainText('100');
  }
  expect(errors).toEqual([]);
});
test('image code is the source file and remains stable as settings change', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/color-math/image');
  await expect(page.locator('#color-response svg')).toBeVisible();
  for (const [language, extension] of [
    ['js', 'js'],
    ['python', 'py'],
    ['c', 'c'],
  ]) {
    await page.locator(`[data-color-language=${language}]`).click();
    const source = readFileSync(
      `snippets/color/adjustments.${extension}`,
      'utf8',
    );
    expect(await page.locator('#color-code').textContent()).toBe(source);
    await page.locator('#adjust-gain').fill('2.3');
    await expect(page.locator('#color-example')).toContainText('2.3');
    expect(await page.locator('#color-code').textContent()).toBe(source);
    await page.locator('#color-reset').click();
    await expect(page.locator('#adjust-gain')).toHaveValue('1');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test('converter displays the same generic source across all source-target pairs', async ({
  page,
}) => {
  await page.goto('/color-math/converter');
  const spaces = ['srgb', 'linear', 'hsl', 'hsv', 'xyz', 'lab', 'oklab'];
  for (const [language, extension] of [
    ['js', 'js'],
    ['python', 'py'],
    ['c', 'c'],
  ]) {
    await page.locator(`[data-color-language=${language}]`).click();
    const source = readFileSync(
      `snippets/color/conversion.${extension}`,
      'utf8',
    );
    for (const from of spaces) {
      await page.locator('#color-source').selectOption(from);
      for (const to of spaces) {
        await page.locator('#color-target').selectOption(to);
        expect(await page.locator('#color-code').textContent()).toBe(source);
      }
    }
  }
});
