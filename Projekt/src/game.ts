// ============================================================
// game.ts — Pure state-transition functions.
// All functions take a GameState and return a new GameState.
// No mutation, no I/O. Recursion used for the dealer's turn.
// ============================================================

import { dealCard } from './deck';
import { calcScore, isBust, isBlackjack } from './hand';
import { Deck, GameOutcome, GameState, Hand } from './types';

// Pure: deals two cards each to player and dealer from the deck.
export const initGame = (deck: Deck): GameState => {
  const [card1, deck1] = dealCard(deck);
  const [card2, deck2] = dealCard(deck1);
  const [card3, deck3] = dealCard(deck2);
  const [card4, deck4] = dealCard(deck3);

  return {
    deck: deck4,
    playerHand: [card1, card3],
    dealerHand: [card2, card4],
    phase: 'player-turn',
  };
};

// Pure: player draws one card — returns entirely new GameState.
export const playerHit = (state: GameState): GameState => {
  const [card, remainingDeck] = dealCard(state.deck);
  const newHand: Hand = [...state.playerHand, card];

  return isBust(newHand)
    ? {
        ...state,
        deck: remainingDeck,
        playerHand: newHand,
        phase: 'finished',
        outcome: 'dealer-wins',
      }
    : {
        ...state,
        deck: remainingDeck,
        playerHand: newHand,
      };
};

// Pure & recursive: dealer draws until score ≥ 17 (house rules).
// Each recursive call returns a new GameState — no mutation.
export const dealerPlay = (state: GameState): GameState => {
  if (calcScore(state.dealerHand) >= 17) return state;

  const [card, remainingDeck] = dealCard(state.deck);
  const newDealerHand: Hand = [...state.dealerHand, card];

  return dealerPlay({
    ...state,
    deck: remainingDeck,
    dealerHand: newDealerHand,
  });
};

// Pure: compares scores and returns a GameState with the outcome set.
const resolveOutcome = (
  playerScore: number,
  dealerScore: number,
  playerBJ: boolean
): GameOutcome => {
  if (playerBJ) return 'player-blackjack';
  if (isBust({ length: 0, [Symbol.iterator]: [][Symbol.iterator] } as never) || dealerScore > 21)
    return 'player-wins';
  if (playerScore > dealerScore) return 'player-wins';
  if (dealerScore > playerScore) return 'dealer-wins';
  return 'push';
};

// Pure: determines the outcome after the dealer finishes playing.
export const determineOutcome = (state: GameState): GameState => {
  const afterDealer = dealerPlay(state);
  const playerScore = calcScore(afterDealer.playerHand);
  const dealerScore = calcScore(afterDealer.dealerHand);

  const outcome: GameOutcome = (() => {
    if (isBlackjack(afterDealer.playerHand)) return 'player-blackjack';
    if (dealerScore > 21) return 'player-wins';
    if (playerScore > dealerScore) return 'player-wins';
    if (dealerScore > playerScore) return 'dealer-wins';
    return 'push';
  })();

  return { ...afterDealer, phase: 'finished', outcome };
};

// Pure: transitions from player-turn to dealer resolution when standing.
export const playerStand = (state: GameState): GameState =>
  determineOutcome({ ...state, phase: 'dealer-turn' });
