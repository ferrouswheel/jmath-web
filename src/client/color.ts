import {
  conversionAlgorithm,
  conversionExample,
} from '../color-conversion-snippets.ts';
import { drawColorExample } from '../color-example.ts';
import {
  adjustmentControls,
  adjustmentDefaults,
  adjustmentLut,
  adjustPixels,
  colorHex,
  colorSpaces,
  decodeSRGB,
  fromLinear,
  inGamut,
  parseHex,
  toLinear,
  validateAdjustments,
  validateColor,
} from '../color-math.ts';
import { colorAlgorithm, colorExample } from '../color-snippets.ts';
import { $, $$, errorMessage } from '../dom.ts';
import type { AdjustmentSettings } from '../types.ts';
const fmt = (n: number) =>
  Math.abs(n) < 1e-7 ? '0' : Number(n.toPrecision(7)).toString();

export function renderColorPage(page: string) {
  if (page === 'converter') renderConverter();
  else if (page === 'image') renderImage();
  else {
    drawColorExample($('#color-hub-example'));
  }
}

function bindCode(
  getSettings: () =>
    | AdjustmentSettings
    | { source: string; target: string; values: number[] }
    | null,
  conversion = false,
) {
  let language = 'js';
  function render() {
    const settings = getSettings();
    const algorithm = conversion
      ? conversionAlgorithm(language)
      : colorAlgorithm(language, settings !== null);
    const example = conversion
      ? settings && 'source' in settings
        ? conversionExample(language, settings)
        : 'Enter valid coordinates to generate a usage example.'
      : colorExample(
          language,
          settings && 'gain' in settings ? settings : null,
        );
    // Preserve code selection and scroll position while controls change.
    if ($('#color-code').textContent !== algorithm)
      $('#color-code').textContent = algorithm;
    if ($('#color-example').textContent !== example)
      $('#color-example').textContent = example;
    $('#color-example-title').textContent = conversion
      ? 'Example using the selected conversion'
      : settings
        ? 'Example using current settings'
        : 'Example';
    $('#color-copy-code').disabled = conversion && !settings;
    $('#color-example-note').textContent = conversion
      ? 'Change values, source, or target in this example to reuse the same converter. The algorithm supports all seven spaces and stays unchanged. Copy code includes both blocks.'
      : settings
        ? 'The controls update this settings block. The function above stays unchanged. Copy code includes both blocks.'
        : 'Copy code includes the functions and this example.';
    $$('[data-color-language]').forEach((b) => {
      const active = b.dataset.colorLanguage! === language;
      b.classList.toggle('selected', active);
      b.setAttribute('aria-pressed', String(active));
    });
    $('#color-code-status').textContent = '';
  }
  $$('[data-color-language]').forEach((b) =>
    b.addEventListener('click', () => {
      language = b.dataset.colorLanguage!;
      render();
    }),
  );
  $('#color-copy-code').addEventListener('click', () =>
    copy(
      $('#color-code').textContent + '\n' + $('#color-example').textContent,
      $('#color-code-status'),
    ),
  );
  render();
  return render;
}
async function copy(value: string, status: HTMLElement) {
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = 'Copied.';
  } catch {
    status.textContent =
      'Clipboard unavailable. Select and copy the displayed text.';
  }
}
function renderConverter() {
  const params = new URLSearchParams(location.search);
  let source = colorSpaces.some((s) => s.id === params.get('from'))
      ? params.get('from')!
      : 'srgb',
    target = colorSpaces.some((s) => s.id === params.get('to'))
      ? params.get('to')!
      : 'lab';
  let values = params.has('c')
    ? params.get('c')!.split(',').map(Number)
    : [59, 130, 246];
  if (!params.has('c')) source = 'srgb';
  let linear = [59, 130, 246].map((v) => decodeSRGB(v / 255));

  const renderCode = bindCode(() => {
    try {
      validateColor(source, values);
      return { source, target, values };
    } catch {
      return null;
    }
  }, true);
  function fields() {
    const space = colorSpaces.find((s) => s.id === source)!;
    $('#color-source').value = source;
    $('#color-channels').innerHTML = space.channels
      .map(
        (label, i) =>
          `<label for="color-channel-${i}">${label}<input id="color-channel-${i}" data-color-channel="${i}" type="number" step="any" min="${space.bounds[i][0]}" max="${space.bounds[i][1]}" value="${values[i] ?? 0}"></label>`,
      )
      .join('');
    $$('[data-color-channel]').forEach((el) =>
      el.addEventListener('input', () => {
        values = [0, 1, 2].map((i) => $(`#color-channel-${i}`).valueAsNumber);
        update();
      }),
    );
  }
  function update() {
    $('#color-target').value = target;
    let valid = true;
    try {
      linear = toLinear(source, values);
      $('#color-input-error').textContent = '';
    } catch (e) {
      valid = false;
      $('#color-input-error').textContent =
        errorMessage(e) + ' Results retain the last valid color.';
    }
    const hex = colorHex(linear),
      gamut = inGamut(linear),
      converted = fromLinear(target, linear);
    $('#color-swatch').style.background = hex;
    $('#color-swatch').setAttribute(
      'aria-label',
      `sRGB preview ${hex}${gamut ? '' : ', clipped to display gamut'}`,
    );
    $('#color-preview-hex').textContent = hex;
    $('#color-picker').value = hex;
    if (document.activeElement !== $('#color-hex')) $('#color-hex').value = hex;
    $('#color-converted').textContent = converted
      ? converted.map(fmt).join(', ')
      : 'Outside the bounded sRGB model';
    $('#color-swap').disabled =
      !valid ||
      !converted ||
      converted.some((v, i: number) => {
        const b = colorSpaces.find((s) => s.id === target)!.bounds[i];
        return v < b[0] - 1e-7 || v > b[1] + 1e-7;
      });
    $('#color-copy').disabled = !valid || !converted;
    $('#color-copy-status').textContent = '';
    $('#color-gamut').textContent = gamut
      ? 'Within the sRGB gamut. The preview is rounded to 8-bit channels.'
      : 'Outside the sRGB gamut. Numeric values are preserved; the preview and hex are clipped.';
    $('#color-all-values').innerHTML = colorSpaces
      .map((s) => {
        const v = fromLinear(s.id, linear);
        return `<tr><th scope="row">${s.name}</th><td>${v ? v.map(fmt).join(', ') : 'Outside bounded sRGB model'}</td></tr>`;
      })
      .join('');
    renderCode();
    if (valid) {
      const url = new URL(location.href);
      url.searchParams.set('from', source);
      url.searchParams.set('to', target);
      url.searchParams.set('c', values.join(','));
      history.replaceState(null, '', url);
    }
  }
  $('#color-source').addEventListener('change', (e) => {
    source = (e.target as HTMLInputElement).value;
    let next = fromLinear(source, linear);
    $('#color-source-note').textContent = '';
    try {
      validateColor(source, next || []);
    } catch {
      next = fromLinear(
        source,
        parseHex(colorHex(linear)).map((v) => decodeSRGB(v / 255)),
      );
      $('#color-source-note').textContent =
        'The previous color is outside this input space. Using the clipped sRGB preview as the new source.';
    }
    values = next!;
    fields();
    update();
  });
  $('#color-target').addEventListener('change', (e) => {
    target = (e.target as HTMLInputElement).value;
    update();
  });
  $('#color-swap').addEventListener('click', () => {
    const next = fromLinear(target, linear);
    const old = source;
    source = target;
    target = old;
    values = next!.map((v, i: number) => {
      const bounds = colorSpaces.find((s) => s.id === source)!.bounds[i];
      return Math.max(bounds[0], Math.min(bounds[1], v));
    });
    fields();
    update();
  });
  function applyHex(text: string) {
    try {
      values = parseHex(text);
      source = 'srgb';
      fields();
      update();
    } catch (e) {
      $('#color-input-error').textContent = errorMessage(e);
    }
  }
  $('#color-hex-apply').addEventListener('click', () =>
    applyHex($('#color-hex').value),
  );
  $('#color-hex').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyHex((e.target as HTMLInputElement).value);
  });
  $('#color-picker').addEventListener('input', (e) =>
    applyHex((e.target as HTMLInputElement).value),
  );
  $('#color-copy').addEventListener('click', () =>
    copy($('#color-converted').textContent, $('#color-copy-status')),
  );
  fields();
  update();
}
function renderImage() {
  let settings = { ...adjustmentDefaults },
    source: ImageData | null = null,
    frame = 0,
    loadVersion = 0,
    loading = false;
  const original = $('#color-original'),
    adjusted = $('#color-adjusted');
  const originalContext = original.getContext('2d', {
      colorSpace: 'srgb',
      willReadFrequently: true,
    })!,
    adjustedContext = adjusted.getContext('2d', { colorSpace: 'srgb' })!;
  const renderCode = bindCode(() => settings);
  function process() {
    frame = 0;
    if (!source) return;
    const result = adjustPixels(source.data, settings);
    adjustedContext.putImageData(
      new ImageData(result.data, source.width, source.height),
      0,
      0,
    );
    $('#color-clip-low').textContent =
      (result.visible ? (100 * result.low) / result.visible : 0).toFixed(2) +
      '%';
    $('#color-clip-high').textContent =
      (result.visible ? (100 * result.high) / result.visible : 0).toFixed(2) +
      '%';
    $('#color-response').innerHTML = responseGraph(settings);
    $('#color-histogram').innerHTML = histogramGraph(result.histogram);
    $('#color-operation').textContent =
      settings.space === 'linear'
        ? 'Decode sRGB → apply the operations below in linear light → encode sRGB for display.'
        : 'Apply the operations below directly to encoded sRGB channels. No transfer-function decoding is performed.';
    renderCode();
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(process);
  }
  function capture(label: string) {
    source = originalContext.getImageData(
      0,
      0,
      original.width,
      original.height,
    );
    adjusted.width = source.width;
    adjusted.height = source.height;
    $('#color-image-info').textContent =
      `${label} · ${source.width} × ${source.height} pixels. PNG/JPEG/WebP uploads are processed locally.`;
    schedule();
  }
  function example(kind: string) {
    loadVersion++;
    loading = false;
    $('#color-download').disabled = Boolean(
      $('#color-adjust-error').textContent,
    );
    $('#color-file').value = '';
    $('#color-image-error').textContent = '';
    drawColorExample(original, kind);
    capture(
      kind === 'chart'
        ? 'Built-in color and grayscale chart'
        : 'Built-in still-life scene',
    );
  }
  function readSettings() {
    try {
      const next = {
        ...adjustmentDefaults,
        space: $('#color-working').value,
        ...Object.fromEntries(
          adjustmentControls.map((p) => [
            p.id,
            $(`#adjust-${p.id}`).valueAsNumber,
          ]),
        ),
      };
      validateAdjustments(next);
      settings = next;
      $('#color-adjust-error').textContent = '';
      $$<HTMLInputElement>('[data-adjust-range]').forEach(
        (el) =>
          (el.value = String(
            settings[
              el.dataset.adjustRange! as keyof Omit<AdjustmentSettings, 'space'>
            ],
          )),
      );
      $('#color-download').disabled = loading;
      schedule();
    } catch (e) {
      $('#color-adjust-error').textContent =
        errorMessage(e) + ' Preview retains the last valid adjustments.';
      $('#color-download').disabled = true;
    }
  }
  $$<HTMLInputElement>('[data-adjust-number]').forEach((el) =>
    el.addEventListener('input', readSettings),
  );
  $$<HTMLInputElement>('[data-adjust-range]').forEach((el) =>
    el.addEventListener('input', () => {
      $(`#adjust-${el.dataset.adjustRange!}`).value = el.value;
      readSettings();
    }),
  );
  $('#color-working').addEventListener('change', readSettings);
  $('#color-reset').addEventListener('click', () => {
    settings = { ...adjustmentDefaults };
    $('#color-working').value = settings.space;
    adjustmentControls.forEach(
      (p) => ($(`#adjust-${p.id}`).value = String(settings[p.id])),
    );
    readSettings();
  });
  $('#color-scene').addEventListener('click', () => example('scene'));
  $('#color-chart').addEventListener('click', () => example('chart'));
  $('#color-file').addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const version = ++loadVersion;
    loading = true;
    $('#color-download').disabled = true;
    $('#color-image-error').textContent = '';
    try {
      if (file.size > 20 * 1024 * 1024)
        throw new Error('Choose an image smaller than 20 MB.');
      const bitmap = await createImageBitmap(file);
      try {
        if (version !== loadVersion) return;
        const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
        original.width = Math.max(1, Math.round(bitmap.width * ratio));
        original.height = Math.max(1, Math.round(bitmap.height * ratio));
        originalContext.clearRect(0, 0, original.width, original.height);
        originalContext.drawImage(
          bitmap,
          0,
          0,
          original.width,
          original.height,
        );
        capture(
          file.name +
            (ratio < 1
              ? ` (resized from ${bitmap.width} × ${bitmap.height})`
              : ''),
        );
      } finally {
        bitmap.close();
      }
    } catch (error) {
      if (version === loadVersion)
        $('#color-image-error').textContent = errorMessage(error).includes(
          '20 MB',
        )
          ? errorMessage(error)
          : 'Unable to decode this image. Choose a PNG, JPEG, or WebP file.';
    } finally {
      if (version === loadVersion) {
        loading = false;
        $('#color-download').disabled = Boolean(
          $('#color-adjust-error').textContent,
        );
      }
    }
  });
  $('#color-download').addEventListener('click', () => {
    if (loading) return;
    if (frame) {
      cancelAnimationFrame(frame);
      process();
    }
    adjusted.toBlob((blob) => {
      if (!blob) {
        $('#color-image-error').textContent = 'PNG export failed.';
        return;
      }
      const url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = 'jmath-adjusted.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  });
  example('scene');
}
function responseGraph(settings: AdjustmentSettings) {
  const { values } = adjustmentLut(settings);
  return `<svg viewBox="0 0 320 190" role="img" aria-label="Channel response curve"><path d="M30 12V160H306M30 160L306 12" fill="none" stroke="#c8c4d1" stroke-dasharray="4 4"/><path d="${Array.from(values, (v, i) => `${i ? 'L' : 'M'}${30 + (i * 276) / 255},${160 - (v * 148) / 255}`).join(' ')}" fill="none" stroke="#688e83" stroke-width="2"/><text x="24" y="180">0</text><text x="297" y="180">1</text><text x="10" y="18">1</text></svg>`;
}
function histogramGraph(bins: Uint32Array) {
  const max = Math.max(1, ...bins);
  return `<svg viewBox="0 0 320 190" role="img" aria-label="Adjusted image linear luminance histogram">${Array.from(bins, (n, i) => `<rect x="${30 + (i * 276) / 64}" y="${160 - (148 * n) / max}" width="${276 / 64}" height="${(148 * n) / max}" fill="#9b8bbe"/>`).join('')}<path d="M30 12V160H306" fill="none" stroke="#c8c4d1"/><text x="24" y="180">0</text><text x="297" y="180">1</text></svg>`;
}
