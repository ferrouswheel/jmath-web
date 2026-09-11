import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const examples = [
  {
    route: '/distributions/normal',
    code: '#snippet-code',
    language: 'data-language',
    source: 'distributions/normal',
    input: '#number-mu',
    value: '2.3',
    copy: '#copy-code',
  },
  {
    route: '/sequences/fibonacci',
    code: '#sequence-code',
    language: 'data-sequence-language',
    source: 'sequences/fibonacci',
    input: '#sequence-n',
    value: '17',
    copy: '#copy-sequence-code',
  },
  {
    route: '/trigonometry/sin',
    code: '#trig-code',
    language: 'data-trig-language',
    source: 'trigonometry/sin',
    input: '#trig-input',
    value: '0.75',
    copy: '#trig-copy',
  },
  {
    route: '/color-math/image',
    code: '#color-code',
    language: 'data-color-language',
    source: 'color/adjustments',
    input: '#adjust-gain',
    value: '2.3',
    copy: '#color-copy-code',
  },
  {
    route: '/color-math/converter',
    code: '#color-code',
    language: 'data-color-language',
    source: 'color/conversion',
    copy: '#color-copy-code',
  },
];

test('distribution initialization preserves edits made before scripts load', async ({
  page,
}) => {
  let resume!: () => void;
  const ready = new Promise<void>((resolve) => {
    resume = resolve;
  });
  await page.route('**/_astro/*.js', async (route) => {
    await ready;
    await route.continue();
  });
  try {
    await page.goto('/distributions/poisson', { waitUntil: 'commit' });
    await page.locator('#number-rate').fill('12');
  } finally {
    resume();
  }
  await expect(page.locator('#stats')).toContainText('12');
  await expect(page.locator('#number-rate')).toHaveValue('12');
});

test('implementation highlighting survives language changes and copies exact source', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const example of examples) {
    await page.goto(example.route);
    for (const [language, extension] of [
      ['js', 'js'],
      ['python', 'py'],
      ['c', 'c'],
    ]) {
      await page.locator(`[${example.language}="${language}"]`).click();
      const code = page.locator(example.code);
      const source = readFileSync(
        `snippets/${example.source}.${extension}`,
        'utf8',
      );
      await expect(code).toHaveAttribute('data-code-language', language);
      expect(
        await code.locator('span[class^="hljs-"]').count(),
      ).toBeGreaterThan(0);
      expect(await code.textContent()).toContain(source);
      if (example.input) {
        await page.locator(example.input).fill(example.value!);
        await expect(
          page.locator(
            example.code === '#color-code' ? '#color-example' : example.code,
          ),
        ).toContainText(example.value!);
        expect(await code.textContent()).toContain(source);
        expect(
          await code.locator('span[class^="hljs-"]').count(),
        ).toBeGreaterThan(0);
      }
      const usage =
        example.code === '#color-code'
          ? '\n' + (await page.locator('#color-example').textContent())
          : '';
      const expected = (await code.textContent()) + usage;
      await page.locator(example.copy).click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe(expected);
    }
  }
});

test('highlighting and accessible typeset math work without JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const example of examples) {
    await page.goto(example.route);
    expect(
      await page.locator(`${example.code} span[class^="hljs-"]`).count(),
    ).toBeGreaterThan(0);
  }
  await page.goto('/theorems/central-limit');
  await expect(page.locator('#statement .katex-display')).toHaveCount(2);
  await expect(page.locator('#statement math').first()).toBeAttached();
  await expect(page.locator('#statement .katex-html').first()).toBeVisible();
  expect(await page.locator('.katex-error').count()).toBe(0);
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator('#statement')
    .screenshot({ path: testInfo.outputPath('central-limit-desktop.png') });
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of [
    '/theorems/central-limit',
    '/theorems/arcsine-inverse',
    '/distributions/normal',
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
  await page.goto('/theorems/central-limit');
  await page
    .locator('#statement')
    .screenshot({ path: testInfo.outputPath('central-limit-mobile.png') });
  await context.close();
});
