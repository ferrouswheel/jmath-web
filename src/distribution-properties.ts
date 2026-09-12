import katex from 'katex';
import type { Distribution, Parameters } from './types.ts';
import { fmt } from './distribution-visuals.ts';

// Symbols match the parameter controls. Conditions describe the full parameter
// range, so a formula remains useful when the current value is undefined.
export const propertyFormulas: Record<string, Record<string, string>> = {
  normal: {
    Mean: String.raw`$\mu$`,
    Variance: String.raw`$\sigma^2$`,
    'Std. deviation': String.raw`$\sigma$`,
    Median: String.raw`$\mu$`,
    Support: String.raw`$(-\infty,\infty)$`,
    Skewness: String.raw`$0$`,
  },
  uniform: {
    Mean: String.raw`$\frac{a+b}{2}$`,
    Variance: String.raw`$\frac{(b-a)^2}{12}$`,
    'Std. deviation': String.raw`$\frac{b-a}{\sqrt{12}}$`,
    Median: String.raw`$\frac{a+b}{2}$`,
    Support: String.raw`$[a,b]$`,
    Skewness: String.raw`$0$`,
  },
  exponential: {
    Mean: String.raw`$\frac{1}{\lambda}$`,
    Variance: String.raw`$\frac{1}{\lambda^2}$`,
    'Std. deviation': String.raw`$\frac{1}{\lambda}$`,
    Median: String.raw`$\frac{\ln 2}{\lambda}$`,
    Support: String.raw`$[0,\infty)$`,
    Skewness: String.raw`$2$`,
  },
  binomial: {
    Mean: String.raw`$np$`,
    Variance: String.raw`$np(1-p)$`,
    'Std. deviation': String.raw`$\sqrt{np(1-p)}$`,
    Mode: String.raw`$\min(n,\lfloor(n+1)p\rfloor)$ Also $(n+1)p-1$ when $(n+1)p$ is an integer and $0<p<1$.`,
    Support: String.raw`$\{0,\ldots,n\}$`,
    Skewness: String.raw`$\frac{1-2p}{\sqrt{np(1-p)}}$ For $0<p<1$; undefined otherwise.`,
  },
  poisson: {
    Mean: String.raw`$\lambda$`,
    Variance: String.raw`$\lambda$`,
    'Std. deviation': String.raw`$\sqrt{\lambda}$`,
    Mode: String.raw`$\lfloor\lambda\rfloor$ Also $\lambda-1$ when $\lambda$ is an integer.`,
    Support: String.raw`$\{0,1,2,\ldots\}$`,
    Skewness: String.raw`$\frac{1}{\sqrt{\lambda}}$`,
  },
  bernoulli: {
    Mean: String.raw`$p$`,
    Variance: String.raw`$p(1-p)$`,
    'Std. deviation': String.raw`$\sqrt{p(1-p)}$`,
    Mode: String.raw`$\begin{cases}0 & p<\frac12\\0,1 & p=\frac12\\1 & p>\frac12\end{cases}$`,
    Support: String.raw`$\{0,1\}$`,
    Skewness: String.raw`$\frac{1-2p}{\sqrt{p(1-p)}}$ For $0<p<1$; undefined otherwise.`,
  },
  geometric: {
    Mean: String.raw`$\frac{1-p}{p}$`,
    Variance: String.raw`$\frac{1-p}{p^2}$`,
    'Std. deviation': String.raw`$\frac{\sqrt{1-p}}{p}$`,
    Mode: String.raw`$0$`,
    Support: String.raw`$\{0,1,2,\ldots\}$`,
    Skewness: String.raw`$\frac{2-p}{\sqrt{1-p}}$ For $p<1$; undefined at $p=1$.`,
  },
  negative_binomial: {
    Mean: String.raw`$\frac{r(1-p)}{p}$`,
    Variance: String.raw`$\frac{r(1-p)}{p^2}$`,
    'Std. deviation': String.raw`$\frac{\sqrt{r(1-p)}}{p}$`,
    Mode: String.raw`$\left\lfloor\frac{(r-1)(1-p)}{p}\right\rfloor$ Also $\frac{(r-1)(1-p)}p-1$ when $\frac{(r-1)(1-p)}p$ is a positive integer.`,
    Support: String.raw`$\{0,1,2,\ldots\}$`,
    Skewness: String.raw`$\frac{2-p}{\sqrt{r(1-p)}}$ For $p<1$; undefined at $p=1$.`,
  },
  discrete_uniform: {
    Mean: String.raw`$\frac{a+b}{2}$`,
    Variance: String.raw`$\frac{(b-a+1)^2-1}{12}$`,
    'Std. deviation': String.raw`$\sqrt{\frac{(b-a+1)^2-1}{12}}$`,
    Median: String.raw`$\frac{a+b}{2}$`,
    Support: String.raw`$\{a,a+1,\ldots,b\}$`,
    Mode: String.raw`$\{a,a+1,\ldots,b\}$ Every integer in the support.`,
  },
  lognormal: {
    Mean: String.raw`$e^{\mu+\sigma^2/2}$`,
    Variance: String.raw`$(e^{\sigma^2}-1)e^{2\mu+\sigma^2}$`,
    'Std. deviation': String.raw`$\sqrt{e^{\sigma^2}-1}\,e^{\mu+\sigma^2/2}$`,
    Median: String.raw`$e^\mu$`,
    Support: String.raw`$(0,\infty)$`,
    Mode: String.raw`$e^{\mu-\sigma^2}$`,
  },
  laplace: {
    Mean: String.raw`$\mu$`,
    Variance: String.raw`$2s^2$`,
    'Std. deviation': String.raw`$s\sqrt{2}$`,
    Median: String.raw`$\mu$`,
    Support: String.raw`$(-\infty,\infty)$`,
    Skewness: String.raw`$0$`,
  },
  logistic: {
    Mean: String.raw`$\mu$`,
    Variance: String.raw`$\frac{\pi^2s^2}{3}$`,
    'Std. deviation': String.raw`$\frac{\pi s}{\sqrt{3}}$`,
    Median: String.raw`$\mu$`,
    Support: String.raw`$(-\infty,\infty)$`,
    Skewness: String.raw`$0$`,
  },
  cauchy: {
    Mean: String.raw`$\text{Undefined}$ For all $x_0$ and $s$.`,
    Variance: String.raw`$\text{Undefined}$ For all $x_0$ and $s$.`,
    'Std. deviation': String.raw`$\text{Undefined}$ For all $x_0$ and $s$.`,
    Median: String.raw`$x_0$`,
    Support: String.raw`$(-\infty,\infty)$`,
    Mode: String.raw`$x_0$`,
  },
  weibull: {
    Mean: String.raw`$s\,\Gamma\!\left(1+\frac1k\right)$`,
    Variance: String.raw`$s^2\!\left[\Gamma\!\left(1+\frac2k\right)-\Gamma\!\left(1+\frac1k\right)^2\right]$`,
    'Std. deviation': String.raw`$s\sqrt{\Gamma\!\left(1+\frac2k\right)-\Gamma\!\left(1+\frac1k\right)^2}$`,
    Median: String.raw`$s(\ln 2)^{1/k}$`,
    Support: String.raw`$[0,\infty)$`,
    Mode: String.raw`$s\left(\frac{k-1}{k}\right)^{1/k}$ For $k>1$; $0$ otherwise.`,
  },
  rayleigh: {
    Mean: String.raw`$\sigma\sqrt{\frac\pi2}$`,
    Variance: String.raw`$\frac{(4-\pi)\sigma^2}{2}$`,
    'Std. deviation': String.raw`$\sigma\sqrt{\frac{4-\pi}{2}}$`,
    Median: String.raw`$\sigma\sqrt{2\ln 2}$`,
    Support: String.raw`$[0,\infty)$`,
    Mode: String.raw`$\sigma$`,
  },
  pareto: {
    Mean: String.raw`$\frac{\alpha x_m}{\alpha-1}$ For $\alpha>1$; $\infty$ otherwise.`,
    Variance: String.raw`$\frac{\alpha x_m^2}{(\alpha-1)^2(\alpha-2)}$ For $\alpha>2$; $\infty$ if $1<\alpha\leq2$; undefined if $\alpha\leq1$.`,
    'Std. deviation': String.raw`$x_m\sqrt{\frac{\alpha}{(\alpha-1)^2(\alpha-2)}}$ For $\alpha>2$; $\infty$ if $1<\alpha\leq2$; undefined if $\alpha\leq1$.`,
    Median: String.raw`$x_m2^{1/\alpha}$`,
    Support: String.raw`$[x_m,\infty)$`,
    Mode: String.raw`$x_m$`,
  },
  triangular: {
    Mean: String.raw`$\frac{a+b+c}{3}$`,
    Variance: String.raw`$\frac{(a-b)^2+(a-c)^2+(b-c)^2}{36}$`,
    'Std. deviation': String.raw`$\frac{\sqrt{(a-b)^2+(a-c)^2+(b-c)^2}}{6}$`,
    Median: String.raw`$a+\sqrt{\frac{(b-a)(c-a)}{2}}$ For $c\geq\frac{a+b}{2}$; otherwise $b-\sqrt{\frac{(b-a)(b-c)}{2}}$.`,
    Support: String.raw`$[a,b]$`,
    Mode: String.raw`$c$`,
  },
};

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );

// Cache the static math markup while numeric values continue to update live.
const formulaMarkup = new Map<string, string>();
function renderFormula(source: string) {
  const cached = formulaMarkup.get(source);
  if (cached) return cached;
  const parts = source.split('$');
  const math = (tex: string, display: boolean) =>
    katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      trust: false,
    });
  const html =
    math(parts[1], true) +
    (parts.slice(2).some((part) => part.trim())
      ? `<div class="stat-condition">${parts
          .slice(2)
          .map((part, i) => (i % 2 ? math(part, false) : escape(part)))
          .join('')}</div>`
      : '');
  formulaMarkup.set(source, html);
  return html;
}

export function renderProperties(d: Distribution, values: Parameters) {
  return Object.entries(d.stats(values))
    .map(([label, value]) => {
      const formula = propertyFormulas[d.id]?.[label];
      if (!formula)
        throw new Error(`Missing ${d.id} property formula: ${label}`);
      return `<div class="stat"><span class="stat-label">${escape(label)}</span><div class="stat-formula">${renderFormula(formula)}</div><strong class="stat-value" style="color: ${escape(d.color)}"><span>Current value: </span>${escape(fmt(value))}</strong></div>`;
    })
    .join('');
}
