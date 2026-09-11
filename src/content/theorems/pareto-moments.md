---
id: pareto-moments
title: When Pareto moments exist
kind: Moment theorem
order: 31
owner: distributions/pareto
related: []
reference:
  url: https://www.randomservices.org/random/special/Pareto.html
  label: "Random: Pareto distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Pareto.html
  label: "Random: Pareto distribution"
---

## Description

A Pareto tail can be too heavy for a requested moment to exist. Comparing the moment order with the tail parameter tells you exactly when an average is finite.

## Conditions

X ∼ Pareto(xₘ, α), xₘ, α > 0; real order q > 0.

## Statement

$$
\mathbb{E}[X^q] = \begin{cases} \dfrac{\alpha x_m^q}{\alpha-q}, & q<\alpha, \\ +\infty, & q\ge\alpha. \end{cases}
$$

## History

The Pareto family, named for Vilfredo Pareto, is a standard heavy-tail model. Its power decay makes the boundary between finite and infinite moments visible in a simple integral.

## Worked example

At α = 3/2 the mean is 3xₘ, but the second moment diverges and no finite variance exists.

## Proof sketch

Integrate x^q αxₘ^α x^(−α−1) from xₘ to infinity. The integral converges exactly when q − α < 0 and then evaluates to the stated expression.
