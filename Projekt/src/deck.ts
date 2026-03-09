// ============================================================
// deck.ts — Pure functions for deck creation, shuffling,
// and dealing. No mutation; all return new values.
// ============================================================

import { Card, Deck, Rank, Suit } from './types';

const SUITS: readonly Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: readonly Rank[] = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10',
  'J', 'Q', 'K', 'A',
];

// Pure: creates a fresh 52-card deck using flatMap (HOF).
export const createDeck = (): Deck =>
  SUITS.flatMap((suit) => RANKS.map((rank): Card => ({ suit, rank })));

// Pure: returns a new shuffled deck (Fisher-Yates on a copy).
// The original deck is never mutated.
export const shuffle = (deck: Deck): Deck => {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

// Pure: removes the top card and returns [dealtCard, remainingDeck].
// Callers never mutate the deck — they receive a new one.
export const dealCard = (deck: Deck): readonly [Card, Deck] => {
  const [top, ...rest] = deck;
  if (!top) throw new Error('Deck is empty');
  return [top, rest] as const;
};
