---
id: bernoulli-sum
title: Sum of Bernoulli trials
kind: Representation theorem
order: 6
owner: distributions/binomial
related:
  - distributions/bernoulli
reference:
  url: https://www.randomservices.org/random/bernoulli/Binomial.html
  label: "Random: Binomial distribution"
historyReference:
  label: "Random: Bernoulli trials"
  url: https://www.randomservices.org/random/bernoulli/Introduction.html
---

## Description

A binomial count is the total of independent yes-or-no outcomes with the same success probability. The representation links an individual trial to an entire experiment.

## Conditions

Independent B₁, …, Bₙ ∼ Bern(p), integer n ≥ 1, 0 ≤ p ≤ 1.

## Statement

$$
\sum_{i=1}^{n} B_i \sim \operatorname{Bin}(n,p).
$$

## History

Bernoulli trials take their name from Jacob Bernoulli. The model abstracts repeated coin tossing into independent experiments with a common success probability.

## Worked example

Ten independent trials with success probability 0.3 give a Bin(10, 0.3) success count.

## Proof sketch

Each particular pattern of k successes has probability pᵏ(1 − p)ⁿ⁻ᵏ. There are C(n, k) such patterns, giving the binomial PMF. Independence and the common probability are essential.
