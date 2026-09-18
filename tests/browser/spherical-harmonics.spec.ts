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

test('drags the x/z foot to reposition n', async ({ page }) => {
  await page.goto('/spherical-harmonics/basis-3d');
  const canvas = page.locator('#sh3-canvas');
  await expect(canvas).toBeVisible();

  // Reproduce the render projection to find the foot's screen position (yaw −0.65, pitch 0.38, lon 35°, lat 24°).
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  const foot = await canvas.evaluate((element: HTMLCanvasElement) => {
    const w = element.width, h = element.height, cx = w / 2, cy = h * .52, scale = Math.min(w, h) * .31;
    const yaw = -.65, pitch = .38, cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const right = [cyw, 0, syw], up = [sp * syw, cp, -sp * cyw];
    const lon = 35 * Math.PI / 180, lat = 24 * Math.PI / 180, k = .72, c = k * Math.cos(lat);
    const foot: [number, number, number] = [c * Math.cos(lon), 0, c * Math.sin(lon)];
    const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return { x: cx + dot(foot, right) * scale, y: cy - dot(foot, up) * scale };
  });

  await page.mouse.move(box!.x + foot.x, box!.y + foot.y);
  await page.mouse.down();
  await page.mouse.move(box!.x + foot.x + 90, box!.y + foot.y - 50, { steps: 5 });
  await page.mouse.up();
  const lon = page.locator('#sh3-lon');
  await expect(lon).not.toHaveValue('35');
  await expect(page.locator('#sh3-lon-value')).toHaveText((await lon.inputValue()) + '°');
  await expect(page.locator('#sh3-n-value')).not.toHaveText('(0.75, 0.41, 0.52)');
});

test('toggles the unit-sphere guide', async ({ page }) => {
  await page.goto('/spherical-harmonics/basis-3d');
  const canvas = page.locator('#sh3-canvas');
  await expect(canvas).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const guide = page.locator('.sh3-options label:has(#sh3-sphere-toggle)');
  await guide.click();
  const without = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await guide.click();
  await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(without);
});

test('shows the basis breakdown and switches implementation languages', async ({ page }) => {
  await page.goto('/spherical-harmonics');
  const code = page.locator('#sh-code');
  await expect(code).toContainText('0.282095');
  await page.click('[data-sh-language="python"]');
  await expect(code).toContainText('def basis');
  await expect(code).toHaveAttribute('data-code-language', 'python');
  await page.click('[data-sh-language="c"]');
  await expect(code).toContainText('sh_basis');

  await page.goto('/spherical-harmonics/basis-3d');
  await expect(page.locator('#sh3-formula')).toHaveText('0.282');
  await page.click('#sh3-basis-picker button[data-index="6"]');
  await expect(page.locator('#sh3-formula')).toHaveText('0.315·(3z² − 1)');
  await page.locator('#sh3-lon').fill('90');
  await page.locator('#sh3-lat').fill('0');
  await expect(page.locator('#sh3-poly-label')).toHaveText('(3z² − 1)');
  await expect(page.locator('#sh3-poly-value')).toHaveText('+2.000');
  await expect(page.locator('#sh3-y-label')).toHaveText('Y₂⁰(n)');
  await expect(page.locator('#sh3-y-value')).toHaveText('+0.631');
});
