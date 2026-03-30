/// <reference path="types.ts" />

const SUITS: Suit[] = ['♠','♥','♦','♣'];
const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

const buildDeck = (): Card[] =>
  SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

const dealCards = (deck: Card[], count: number): [Card[], Card[]] =>
  [deck.slice(0, count), deck.slice(count)];
