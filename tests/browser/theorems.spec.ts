import { test, expect } from '@playwright/test';
import { theorems, theoremUrl } from '../../src/theorems';

test('every theorem has a standalone page and working links without JavaScript', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/theorems');
  await expect(page.locator('.theorem-card')).toHaveCount(theorems.length);
  for (const theorem of theorems) {
    const url = theoremUrl(theorem);
    expect((await page.goto(url))?.status(), url).toBe(200);
    await expect(page.locator('h1')).toHaveText(theorem.title);
    await expect(page.locator('#history p')).not.toBeEmpty();
    for (const [selector, html] of [
      ['#proof .theorem-prose', theorem.html.proof],
      ['#statement .theorem-prose:first-of-type', theorem.html.conditions],
    ]) {
      const text = await page.evaluate((html) => {
        const element = document.createElement('div');
        element.innerHTML = html;
        return element.textContent ?? '';
      }, html);
      await expect(page.locator(selector)).toHaveText(text);
    }
    for (const related of theorem.pages) {
      await expect(
        page.locator(`#related-pages a[href="${related.url}"]`),
      ).toHaveText(`${related.name} →`);
      expect((await context.request.get(related.url)).status()).toBe(200);
    }
    // Existing shared fragment URLs must still resolve to a card that links out.
    await page.goto(`${theorem.pages[0].url}#theorem-${theorem.id}`);
    const card = page.locator(`#theorem-${theorem.id}`);
    await expect(card).toBeVisible();
    await card.locator('h3 a').click();
    await expect(page).toHaveURL(new RegExp(`${url}/?$`));
    await page.locator('#related-pages a').first().click();
    await expect(page).toHaveURL(new RegExp(`${theorem.pages[0].url}/?$`));
  }
  await context.close();
});

test('theorem reading layout fits a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/theorems/negative-binomial-tail');
  await expect(page.locator('h1')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator('.theorem-contents a[href="#history"]').click();
  await expect(page.locator('#history')).toBeInViewport();
});
