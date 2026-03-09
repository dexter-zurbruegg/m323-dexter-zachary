// ============================================================
// index.ts — Entry point.
// Wires pure functions into a single startup pipeline:
//   createDeck → shuffle → initGame → startGame (I/O)
// pipe() from utils.ts composes the first three steps.
// ============================================================

import { createDeck, shuffle } from './deck';
import { initGame } from './game';
import { startGame } from './io';
import { pipe } from './utils';
import { Deck } from './types';

// A clear data pipeline: raw deck → shuffled → initial game state.
const prepareGame = pipe<Deck>(shuffle);

const main = async (): Promise<void> => {
  console.log('\n  ♠ ♥ ♦ ♣   BLACKJACK   ♣ ♦ ♥ ♠');
  console.log('  Functional Edition — M323 Project\n');

  const deck = createDeck();
  const shuffledDeck = prepareGame(deck);
  const initialState = initGame(shuffledDeck);

  await startGame(initialState);
};

main().catch(console.error);
