/// <reference path="types.ts" />

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// pure function: builds a fresh 52-card deck using flatMap (HOF)
const buildDeck = (): Card[] =>
  SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));

// pure function: returns a new shuffled deck
// uses a copy so the original deck is never modified (immutability)
const shuffleDeck = (deck: Card[]): Card[] => {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

// pure function: splits deck into [first n cards, rest] using slice (no mutation)
const dealCards = (deck: Card[], n: number): [Card[], Card[]] =>
  [deck.slice(0, n), deck.slice(n)];
