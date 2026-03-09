// ============================================================
// utils.ts — Generic higher-order functions and function
// composition utilities. pipe() enables clean data pipelines.
// ============================================================

import { Card, Hand } from './types';

// Generic pipe: chains any number of unary functions left-to-right.
// The return type of each step must match the input of the next.
export const pipe =
  <T>(...fns: ReadonlyArray<(arg: T) => T>) =>
  (initial: T): T =>
    fns.reduce((value, fn) => fn(value), initial);

// A typed HOF that filters cards in a hand by a predicate.
export const filterCards =
  (predicate: (card: Card) => boolean) =>
  (hand: Hand): Hand =>
    hand.filter(predicate);

// A typed HOF that transforms every card in a hand.
export const mapCards =
  (transform: (card: Card) => Card) =>
  (hand: Hand): Hand =>
    hand.map(transform);

// Sums an array of numbers — pure utility used in score calculation.
export const sum = (numbers: readonly number[]): number =>
  numbers.reduce((total, n) => total + n, 0);
