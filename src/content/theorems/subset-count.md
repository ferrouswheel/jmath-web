---
id: subset-count
title: Number of subsets
kind: Counting theorem
order: 47
owner: sequences/powers-of-two
related: []
reference:
  label: "OEIS A000079: formulas and references"
  url: https://oeis.org/A000079
historyReference:
  label: "OEIS A000079: formulas and references"
  url: https://oeis.org/A000079
---

## Description

Each element of a finite set has two choices: included or excluded. Binary choices therefore count every subset exactly once, including the empty set.

## Conditions

A finite set with n elements, where n ≥ 0.

## Statement

$$
|\mathcal{P}(S)| = 2^{|S|} = 2^n.
$$

Here $\mathcal{P}(S)$ is the set of all subsets of an $n$-element set $S$.

## History

This is a fundamental application of the multiplication principle in finite counting. The correspondence with binary strings also connects subset enumeration to the powers-of-two sequence.

## Worked example

A three-element set has 1 empty subset, 3 singletons, 3 pairs, and 1 full subset: 8 in total.

## Proof sketch

For each element choose either inclusion or exclusion. Each string of n binary choices determines exactly one subset, and each subset determines one string. Multiplying the two choices at each position gives 2ⁿ. For n = 0 there is one subset, the empty set.
