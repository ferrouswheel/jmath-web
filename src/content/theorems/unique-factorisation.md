---
id: unique-factorisation
title: Fundamental theorem of arithmetic
kind: Theorem
order: 49
owner: sequences/primes
related: []
reference:
  label: NIST DLMF §27.2, fundamental theorem of arithmetic
  url: https://dlmf.nist.gov/27.2#i
historyReference:
  label: NIST DLMF §27.2, fundamental theorem of arithmetic
  url: https://dlmf.nist.gov/27.2#i
---

## Description

Prime numbers are the uniquely determined multiplicative building blocks of positive integers greater than one. Only the order of the factors can change.

## Conditions

Integer m > 1; order of the factors is ignored.

## Statement

Every integer greater than 1 has a unique factorisation into primes.

## History

Unique factorisation is foundational to elementary number theory. Euclid’s lemma supplies the key step in the standard uniqueness proof: a prime dividing a product must divide one of its factors.

## Worked example

360 = 2³ × 3² × 5. Rearranging these factors does not give a different factorisation.

## Proof sketch

Existence follows by induction: a composite integer splits into smaller factors until only primes remain. For uniqueness, use Euclid’s lemma: if a prime divides a product, it divides a factor. A prime in one factorisation must therefore occur in the other; cancel it and repeat.
