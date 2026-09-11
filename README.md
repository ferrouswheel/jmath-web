# jmath

Browser-based mathematical reference tools, probability simulations, and integer sequences.

## Run

The site uses Astro static pages and strict TypeScript. Install dependencies, then start the development server:

```sh
npm ci
npm start
# http://localhost:5173
```

Astro requires Node.js 22.12 or newer. The project also installs a local Node 22 runtime used automatically by npm scripts, so the existing global Node installation need not change. Native build dependencies must be installed under a supported Node version. If bootstrapping with an older Node, follow the first install with `PATH="$PWD/node_modules/.bin:$PATH" npm install --include=optional`.

```sh
npm run check       # strict TypeScript and Astro checks
npm test            # numerical tests and executable JS/Python/C snippets
npm run test:e2e    # build, then browser regressions against production HTML
npm run build       # checked static build in dist/
npm run preview     # serve the build locally
```

The numerical tests require Python 3 and a C99 compiler (`cc`). Browser tests use Chrome at `CHROME_PATH`, an installed Chrome at `/opt/google/chrome/chrome`, or Playwright Chromium (`npx playwright install chromium`).

Publish **`dist/`** to a static host. Every catalogue and detail URL has its own generated `index.html`; configure directory-index serving and use `404.html` for missing routes. No single-page-app fallback is needed. The reference text, formulas, theorems, default graphs, and snippets are available without JavaScript. Calculators, simulations, image processing, and live controls run in the browser.

## Repository structure

- `src/pages/`: Astro routes, including generated distribution, sequence, and trigonometry detail pages.
- `src/layouts/` and `src/components/`: shared page layout and section markup.
- `src/client/`: page-specific TypeScript event handlers and interactive updates.
- `src/*.ts`: mathematical implementations, typed catalogue data, SVG renderers, and snippet usage-example builders.
- `src/snippet-files/`: raw imports of the standalone algorithm sources, grouped by section so unrelated algorithms stay out of each page's scripts.
- `snippets/`: actual JavaScript, Python, and C implementations displayed by the site.
- `tests/`: numerical and cross-language checks; `tests/browser/` covers generated HTML and interactive behavior.

## Maintaining code snippets

Edit the actual files under `snippets/distributions/`, `snippets/sequences/`, `snippets/trigonometry/`, or `snippets/color/`. These are the authoritative algorithm sources, not generated copies. The UI imports them verbatim with Vite's `?raw` support. Node tests use a small loader with the same behavior.

The TypeScript snippet modules only append usage examples using the selected values. They do not assemble algorithm bodies or stringify functions. Image adjustments and the generic seven-space converter display the stable algorithm separately from the changing example.

`npm test` checks every source file, compiles C with warnings treated as errors, and executes all three languages against numerical expectations, boundary cases, sampling statistics, or conversion pairs. A separate check verifies that all 102 source files match the text imported for display. For a new item, add all three source files, register their imports in the section's `src/snippet-files/` module, add catalogue metadata and numerical cases, and update the inventory count in `tests/snippet-files.test.js`.

The files contain reusable functions. JavaScript and Python example calls, or a C `main`, are appended by the site's copyable usage examples. A C algorithm file on its own can be checked with `cc -std=c99 -Wall -Wextra -Werror -fsyntax-only snippets/color/conversion.c`; link a calling program with `-lm` to run it.

## Included

17 distributions:

- Continuous: Normal, Uniform, Exponential, Lognormal, Laplace, Logistic, Cauchy, Weibull, Rayleigh, Pareto (Type I), and Triangular.
- Discrete: Binomial, Poisson, Bernoulli, Geometric, Negative Binomial, and Discrete Uniform.

Geometric counts failures before the first success; Negative Binomial counts failures before `r` successes and uses integer `r`. Both start at zero. Discrete Uniform includes both integer bounds. Triangular currently requires an interior mode (`a < c < b`). Exponential uses a rate parameter, while Weibull, Laplace, and Logistic use scale parameters. Lognormal parameters describe the underlying normal `log(X)`.

Each has searchable catalogue metadata, adjustable parameters, PDF/PMF and CDF plots, calculated properties, a pointwise CDF calculator, explanatory context, and a mathematical reference. Each explorer also includes copyable JavaScript, Python, and C source for the PDF/PMF and sampling algorithm. Snippets use only standard-library elementary math and uniform random sources, with no external packages or distribution helpers. Example calls track the current parameters. Python and C examples seed their own runtime RNG; these sequences do not match the page generator. C examples include a C99 compilation command (`cc -std=c99 snippet.c -lm -o snippet`). Parameter guards match the explorer limits, including the Poisson product sampler’s rate limit of 50.

Sample generation supports 1–10,000 values, optional reproducible string seeds, and CSV export with distribution and parameter metadata. The catalogue lives at `/`. Each distribution has a dedicated page, e.g. `/distributions/poisson` or `/distributions/negative-binomial`, with its explorer and a link back to the catalogue. Cards are native links that support new tabs and browser history; catalogue search and filters are restored when navigating Back. Old hash links such as `/#poisson` redirect to their dedicated pages.

## Dice & coins

Open `/random-tools` for the tools hub, `/random-tools/dice` for the dice roller, or `/random-tools/coins` for the coin flipper. The section is linked from the sidebar and mobile navigation.

- Roll 1–6 fair dice, with 2–20 sides each; each trial records their sum.
- Flip 1–100 independent coins with adjustable heads probability; each trial records the number of heads.
- Add a single trial or N more trials to the same experiment, up to 100,000 total. Batches update the histogram as they run and can be stopped while retaining completed trials.
- Compare observed proportions with exact PMF markers, observed and theoretical mean/variance, a frequency table, and total variation distance. Variance uses divisor N. Download the table as CSV with experiment settings and expected counts.
- A seed gives a repeatable sequence across single trials and batches. Changing settings or seed clears prior samples; reset restarts the same seeded sequence. Unseeded trials use `Math.random`; no random.org API or atmospheric randomness is used.

One die is Discrete Uniform; sums use exact repeated convolution. A single coin is Bernoulli and the number of heads across several coins is Binomial. Related-distribution links carry their current parameters into the catalogue explorer. For multiple dice, the link describes the distribution of one die, while the experiment displays the exact sum distribution.

Numerical experiment logic lives in `src/experiments.ts`; the pages are rendered by `src/client/random.ts`. Tests cover exact dice probabilities, coin endpoints, normalization and moments, reproducibility across batch sizes, empirical agreement, trial limits, and CSV metadata.

## Number sequences

Open `/sequences` for the catalogue. Dedicated pages cover square, cube, Fibonacci, triangular, pentagonal, hexagonal, powers-of-two, and prime sequences.

Each page provides an exact nth-term calculator (up to n = 1,000), nearby terms, a formula or defining recurrence, worked calculation steps, identities, geometric interpretation, and an OEIS reference. All sequences start at index 0 except primes, whose first term is p₁ = 2. Fibonacci explicitly uses F₀ = 0 and F₁ = 1. The selected index is shareable, for example `/sequences/fibonacci?n=100`.

The calculator uses built-in BigInt arithmetic. JavaScript and Python snippets retain exact values throughout the calculator range. C snippets use checked `uint64_t` arithmetic: Fibonacci supports n ≤ 93 and powers of two n ≤ 63; other sequences support the full range. Unsupported C inputs return an error rather than overflowing.

Diagrams show dot lattices, exploded cube layers, Fibonacci square tilings, binary trees, or a prime sieve. Large selected indices retain their exact numerical results while the diagram explicitly labels its smaller visualization index. Polygonal diagrams use ordinary vertex-anchored pentagonal and hexagonal numbers, not the centered sequences. Fibonacci diagram labels indicate square side lengths; the full rectangle area is FₙFₙ₊₁. The binary tree term counts leaves, not all nodes.

Definitions and geometric data are in `src/sequences.ts`, SVG rendering in `src/sequence-visuals.ts`, page rendering in `src/components/SequenceDetail.astro and src/client/sequences.ts`, and standalone implementations in `snippets/sequences/`. Tests check reference terms, large integer values, figurate identities, dot and cube counts, Fibonacci tiling areas/non-overlap, and all 24 language/sequence implementations.

## Extending the catalogue

Add an entry in `src/distributions.ts` or its `src/more-distributions.ts` registry with metadata, parameter limits, density/mass and CDF functions, plotting range, statistics, sampling function, and reference. Page markup is in `src/components/Distribution.astro` and interactions are in `src/client/distributions.ts`. Catalogue counts update automatically. Add the three implementation files in `snippets/distributions/` and the algorithm explanation in `src/snippets.ts`. Integer parameters use `integer: true`; cross-parameter bounds use `constraints`. Distributions without a finite mean provide `exampleX` for calculator and snippet defaults. Optional `plotKnots` add points near peaks or discontinuities. Keep mathematical tests in `tests/`.

The normal and lognormal CDFs use a numerical approximation (absolute error approximately 1e-7). Plots show a finite range; unbounded tails continue beyond the view. Cauchy and Pareto display undefined or infinite moments explicitly. For Weibull shape below 1, the density diverges at zero, so the graph starts at the 0.5th percentile and labels this omission. Weibull moments use a Lanczos gamma approximation. Sample generators are for exploration and simulation, not cryptographic use. Controls intentionally bound parameters to keep computation responsive; those UI limits are not the full mathematical domains. Samples stay in the browser. Google Fonts are optional and fall back to system sans-serif fonts.

Mathematical references: [NIST distribution gallery](https://www.itl.nist.gov/div898/handbook/eda/section3/eda366.htm) and Kyle Siegrist’s [Random: Probability, Mathematical Statistics, and Stochastic Processes](https://www.randomservices.org/random/special/index.html). Each entry links directly to its relevant reference.

Snippet tests execute JavaScript and Python examples and compile C with warnings treated as errors, then verify densities, sample moments where finite, and empirical cumulative probabilities at default and boundary parameters. All 51 language/distribution combinations are exercised. Python 3 and a C compiler (`cc`) are required for their respective checks; unavailable runtimes are reported as skipped.

Sequence pages include related theorems and identities with explicit conditions, fixed worked examples, expandable proof sketches, and source links. Content lives in `src/sequence-theorems.ts`; each result has a stable `#theorem-<id>` link.

All 17 distribution pages include two related results in `src/distribution-theorems.ts`, with assumptions, fixed examples, proof sketches, and references. Distribution and sequence pages share `src/theorem-view.ts` and support direct `#theorem-<id>` links.

Trigonometry is available at `/trigonometry` and `/trigonometry/{sin,cos,tan,arcsin,arccos,arctan}`. Each page includes a radians/degrees calculator, graph, unit circle, exact-value table, principal domains/ranges, derivative, identities and direct JS/Python/C algorithms. Query parameters `x` and `unit` preserve calculator state. Numerical implementations use arithmetic series and standard square roots (no built-in trig); direct angles are limited to ±10000 radians and tangent rejects |cos θ| < 1e-12. Results are floating-point approximations. These URLs are generated as individual static pages.

Color math: `/color-math`, `/color-math/converter`, and `/color-math/image`. Seven conversion spaces include encoded/linear sRGB, HSL, HSV, XYZ D65 (Ywhite=1), CIELAB D50 with Bradford adaptation, and Oklab. Numerical RGB values retain out-of-gamut coordinates; swatches clip to sRGB. Image adjustments use explicit linear-light or encoded-sRGB gain/exposure, pivoted contrast, additive brightness, and a power curve. Built-in procedural scene and test chart require no network assets. Local PNG/JPEG/WebP uploads are resized to at most 1200 px on the longest side; exports use that size and preserve pixel alpha. Standalone JS/Python/C examples show the transfer functions and current per-channel operation. Add `/color-math/*` to static-host SPA fallback routes.

Image-adjustment snippets keep reusable parameterized algorithms separate from the live settings example. Copy code combines the stable function and the current example in the selected language.

The color-space converter includes complete standalone JavaScript, Python, and C algorithms for all 49 source/target combinations. Named source and target spaces and input coordinates live in a separate usage block, so selecting a different conversion does not rewrite the algorithm. All implementations share the same matrix constants, scales, input bounds, D50/D65 adaptation, and out-of-gamut handling as the calculator.
