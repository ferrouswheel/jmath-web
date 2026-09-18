import { expect, test } from '@playwright/test';

test('orbits a world-fixed spherical harmonics signal', async ({ page }) => {
  await page.goto('/spherical-harmonics');

  const sphere = page.locator('#sh-sphere');
  const direction = page.locator('#sh-direction');
  await expect(sphere).toBeVisible();
  await sphere.scrollIntoViewIfNeeded();
  await expect(direction).toContainText('x ');
  const before = await direction.textContent();

  const box = await sphere.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * .7, box!.y + box!.height * .38, { steps: 8 });
  await page.mouse.up();
  await expect(direction).not.toHaveText(before!);

  await page.getByRole('button', { name: /SH0/ }).click();
  await expect(page.getByRole('button', { name: /SH0/ })).toHaveClass(/selected/);
  await expect(page.getByText('3 RGB coeffs')).toBeVisible();
  const baseColour = page.getByLabel('Colour for Y00');
  const baseDiagram = page.locator('[data-basis-index="0"]');
  const diagramBefore = await baseDiagram.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await baseColour.fill('#ff2200');
  await expect(baseColour).toHaveValue('#ff2200');
  await expect(page.locator('.sh-colour-row:not(.hidden)')).toHaveCount(1);
  await expect.poll(() => baseDiagram.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())).not.toBe(diagramBefore);

  const signVisual = page.locator('.sh-sign-visual svg');
  await signVisual.scrollIntoViewIfNeeded();
  const signBox = await signVisual.boundingBox();
  await page.mouse.move(signBox!.x + signBox!.width * .75, signBox!.y + signBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(signBox!.x + signBox!.width * .25, signBox!.y + signBox!.height / 2);
  await page.mouse.up();
  await expect(page.locator('#sh-sample-operation')).toHaveText('subtracts RGB');
  await expect(page.locator('#sh-sample-value')).toContainText('-');
});

test('explores complete 3D basis surfaces', async ({ page }) => {
  await page.goto('/spherical-harmonics/basis-3d');
  const canvas = page.locator('#sh3-canvas');
  await expect(canvas).toBeVisible();
  await expect(page.locator('#sh3-basis-picker button')).toHaveCount(16);

  await page.getByRole('button', { name: /Select Y₂⁰/ }).click();
  await expect(page.locator('#sh3-title')).toHaveText('Y₂⁰');
  await expect(page.locator('#sh3-formula')).toContainText('3z²');

  const before = await page.locator('#sh3-y-value').textContent();
  await page.locator('#sh3-lat').fill('70');
  await expect(page.locator('#sh3-y-value')).not.toHaveText(before!);

  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  const imageBefore = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * .7, box!.y + box!.height * .4, { steps: 5 });
  await page.mouse.up();
  await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(imageBefore);
});
