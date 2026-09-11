---
id: euclid
title: Euclid’s theorem
kind: Theorem
order: 48
owner: sequences/primes
related: []
reference:
  label: Euclid, Elements IX.20
  url: https://mathcs.clarku.edu/~djoyce/elements/bookIX/propIX20.html
historyReference:
  label: Euclid, Elements IX.20
  url: https://mathcs.clarku.edu/~djoyce/elements/bookIX/propIX20.html
---

## Description

No finite list can contain every prime. Constructing a number that leaves remainder one on division by each listed prime guarantees another prime divisor.

## Conditions

Primes are positive integers greater than 1 with exactly two positive divisors.

## Statement

There are infinitely many prime numbers.

## History

The result appears in Euclid’s Elements, Book IX, Proposition 20. Euclid presents a construction beyond an assigned collection of primes; the familiar product-plus-one argument expresses that idea in modern notation.

## Worked example

For the list 2, 3, 5, the number 2 × 3 × 5 + 1 = 31 has a prime divisor outside the list.

## Proof sketch

Given any finite list of primes, form their product plus 1. This integer is greater than 1, so it has a prime divisor. Division by each listed prime leaves remainder 1; therefore that divisor is not on the list. The product plus 1 need not itself be prime: 2 × 3 × 5 × 7 × 11 × 13 + 1 = 30031 = 59 × 509.
