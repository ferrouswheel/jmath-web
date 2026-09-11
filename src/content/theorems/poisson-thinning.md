---
id: poisson-thinning
title: Independent thinning
kind: Thinning theorem
order: 9
owner: distributions/poisson
related:
  - distributions/binomial
  - distributions/bernoulli
reference:
  url: https://www.randomservices.org/random/poisson/Poisson.html
  label: "Random: Poisson distribution"
historyReference:
  url: https://www.randomservices.org/random/poisson/Poisson.html
  label: "Random: Poisson distribution"
---

## Description

Randomly classifying Poisson events produces two independent Poisson counts. The independence is stronger than merely knowing the expected size of each group.

## Conditions

N ∼ Poisson(λ). Retain each item independently with probability q ∈ [0, 1], independently of N.

## Statement

$$
R\sim\operatorname{Poisson}(\lambda q), \qquad D\sim\operatorname{Poisson}\!\left(\lambda(1-q)\right), \qquad R\perp D.
$$

Here $R$ and $D$ are the retained and discarded counts; $R\perp D$ means they are independent.

## History

Thinning is a standard construction for Poisson processes and randomly marked events. It relates a random total count to Bernoulli decisions made separately for each event.

## Worked example

Retaining one quarter of a mean-8 count gives mean 2 retained and mean 6 discarded.

## Proof sketch

For retained count r and discarded count d, multiply P(N = r + d) by the conditional binomial probability. It factors into the two Poisson PMFs, proving independence as well as the marginals. A zero parameter means a constant zero count.
