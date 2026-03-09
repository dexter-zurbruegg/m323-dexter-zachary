// ============================================================
// types.ts — All domain types for the Blackjack game.
// Types drive the design: union types, readonly records, ADTs.
// ============================================================

export type Suit = '♠' | '♥' | '♦' | '♣';

export type Rank =
  | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K' | 'A';

export type Card = Readonly<{
  suit: Suit;
  rank: Rank;
}>;

export type Deck = readonly Card[];

export type Hand = readonly Card[];

export type GameOutcome =
  | 'player-blackjack'
  | 'player-wins'
  | 'dealer-wins'
  | 'push';

export type GamePhase = 'player-turn' | 'dealer-turn' | 'finished';

export type GameState = Readonly<{
  deck: Deck;
  playerHand: Hand;
  dealerHand: Hand;
  phase: GamePhase;
  outcome?: GameOutcome;
}>;
