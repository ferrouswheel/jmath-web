---
id: cauchy-mean
title: The Cauchy expectation does not exist
kind: Moment result
order: 25
owner: distributions/cauchy
related: []
reference:
  url: https://www.randomservices.org/random/special/Cauchy.html
  label: "Random: Cauchy distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Cauchy.html
  label: "Random: Cauchy distribution"
---

## Description

Symmetry does not guarantee that a mean exists. The Cauchy distribution is a central example: the positive and negative first-moment integrals both diverge.

## Conditions

X ∼ Cauchy(x₀, s), s > 0.

## Statement

$$
\mathbb{E}[X] \text{ is undefined; no finite variance exists.}
$$

## History

The Cauchy law serves as a counterexample to unrestricted averaging arguments in probability. It distinguishes an expectation from a symmetric principal value, which can hide divergent tails.

## Worked example

Cauchy(0, 1) has median 0, but it does not have mean 0.

## Proof sketch

Its density decays like a positive constant times 1/x². Hence each tail’s absolute first-moment integral behaves like ∫₁∞ dx/x and diverges. Symmetric cancellation gives a principal value, not an expectation.
