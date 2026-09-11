---
id: indicator-expectation
title: Expectation of an indicator
kind: Expectation identity
order: 10
owner: distributions/bernoulli
related:
  - distributions/binomial
reference:
  url: https://www.randomservices.org/random/bernoulli/Introduction.html
  label: "Random: Bernoulli trials"
historyReference:
  label: "Random: Bernoulli trials"
  url: https://www.randomservices.org/random/bernoulli/Introduction.html
---

## Description

Encoding an event as zero or one turns its probability into an expectation. This lets you count expected occurrences by adding probabilities, even when events depend on one another.

## Conditions

A is any event; Iₐ is 1 when A occurs and 0 otherwise.

## Statement

$$
I_A \sim \operatorname{Bern}\!\left(\Pr(A)\right), \qquad \mathbb{E}[I_A] = \Pr(A).
$$

## History

Indicator variables express the Bernoulli model as algebra. The trial model is named after Jacob Bernoulli; its zero-or-one encoding also lets general events enter expectation calculations.

## Worked example

A fair die’s indicator for an even face has expectation 1/2.

## Proof sketch

The expectation is 1 · P(A) + 0 · P(Aᶜ). Consequently, the expected number of events occurring is the sum of their probabilities, even when those events are dependent.
