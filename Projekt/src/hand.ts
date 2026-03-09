// ============================================================
// hand.ts — Pure functions for evaluating a hand's score.
// Uses reduce (HOF) and handles Ace soft/hard values.
// ============================================================

import { Card, Hand, Rank } from './types';
import { sum } from './utils';

const FACE_RANKS: readonly Rank[] = ['J', 'Q', 'K'];

// Pure: returns the base numeric value of a single card.
export const cardValue = (card: Card): number => {
  if (card.rank === 'A') return 11;
  if (FACE_RANKS.includes(card.rank)) return 10;
  return Number(card.rank);
};

// Pure: calculates the best score for a hand.
// Aces are reduced from 11 to 1 whenever the hand would bust.
export const calcScore = (hand: Hand): number => {
  const baseScore = sum(hand.map(cardValue));
  const aceCount = hand.filter((c) => c.rank === 'A').length;

  // Reduce aces from 11→1 until no longer busting (or no aces left).
  return Array.from({ length: aceCount }).reduce<number>(
    (score) => (score > 21 ? score - 10 : score),
    baseScore
  );
};

// Pure predicates — composed from calcScore.
export const isBust = (hand: Hand): boolean => calcScore(hand) > 21;

export const isBlackjack = (hand: Hand): boolean =>
  hand.length === 2 && calcScore(hand) === 21;

// Pure: formats a card as a readable string for display.
export const formatCard = (card: Card): string =>
  `${card.rank}${card.suit}`;

// Pure: formats an entire hand as a comma-separated string.
export const formatHand = (hand: Hand): string =>
  hand.map(formatCard).join('  ');
