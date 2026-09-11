---
id: central-limit
title: Central limit theorem
kind: Limit theorem
order: 0
owner: distributions/normal
related:
  - distributions/bernoulli
  - distributions/binomial
reference:
  url: https://www.randomservices.org/random/sample/CLT.html
  label: "Random: Central limit theorem"
historyReference:
  url: https://www.randomservices.org/random/sample/CLT.html
  label: "Random: Central limit theorem"
---

## Description

Averages of many independent measurements develop a predictable bell-shaped pattern after centring and scaling. This explains why the normal distribution appears even when individual observations are not normal.

## Conditions

Let $X_1, X_2, \ldots$ be independent and identically distributed random variables with mean $\mu$ and finite, positive variance $\sigma^2$:

$$
\mathbb{E}[X_i] = \mu,
\qquad 0 < \operatorname{Var}(X_i) = \sigma^2 < \infty.
$$

Their sample mean is $\displaystyle \bar{X}_n = \frac{1}{n}\sum_{i=1}^{n} X_i$.

## Statement

$$
\frac{\sqrt{n}\,(\bar{X}_n - \mu)}{\sigma}
\xrightarrow{\;d\;} \mathcal{N}(0,1)
$$

As $n \to \infty$, the standardised sample mean approaches a standard normal distribution. The arrow denotes convergence in distribution.

## History

De Moivre established an early special case for Bernoulli trials. The result grew into a general limit theorem, and George Pólya introduced the name “central limit theorem” in 1920.

## Worked example

For independent fair coin indicators, $X_i$ is $1$ for heads and $0$ for tails. Here $\mu = \tfrac12$ and $\sigma = \tfrac12$, so

$$
2\sqrt{n}\left(\bar{X}_n - \frac12\right)
\xrightarrow{\;d\;} \mathcal{N}(0,1).
$$

## Proof sketch

For the centred, standardised variable $Y_i = (X_i - \mu)/\sigma$, the characteristic function has the expansion

$$
\varphi_Y(t) = 1 - \frac{t^2}{2} + o(t^2)
\qquad \text{as } t \to 0.
$$

Independence makes the normalised sum’s characteristic function

$$
\left[\varphi_Y\!\left(\frac{t}{\sqrt{n}}\right)\right]^n
\longrightarrow e^{-t^2/2},
$$

which is the characteristic function of $\mathcal{N}(0,1)$. This establishes convergence in distribution. The theorem is a limiting result, not an exact finite-sample identity.
