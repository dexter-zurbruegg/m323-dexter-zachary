// ============================================================
// io.ts — ALL side effects are isolated here.
// Console output and readline input live only in this file.
// Pure game logic from game.ts is called from here but never
// mixed with I/O concerns.
// ============================================================

import * as readline from 'readline';
import { calcScore } from './hand';
import { formatHand } from './hand';
import { playerHit, playerStand } from './game';
import { GameState } from './types';

// Side-effecting display function — prints current game state.
export const displayState = (state: GameState, revealDealer = false): void => {
  console.log('\n' + '='.repeat(50));
  console.log(`  YOUR HAND   (${calcScore(state.playerHand)}): ${formatHand(state.playerHand)}`);

  if (revealDealer || state.phase === 'finished') {
    console.log(`  DEALER HAND (${calcScore(state.dealerHand)}): ${formatHand(state.dealerHand)}`);
  } else {
    const [firstCard] = state.dealerHand;
    const first = firstCard ? `${firstCard.rank}${firstCard.suit}` : '?';
    console.log(`  DEALER HAND: ${first}  🂠`);
  }
  console.log('='.repeat(50));
};

// Displays the game result with a clear outcome message.
export const displayOutcome = (state: GameState): void => {
  displayState(state, true);
  const messages: Record<NonNullable<GameState['outcome']>, string> = {
    'player-blackjack': '🃏  BLACKJACK! You win!',
    'player-wins':      '🎉  You win!',
    'dealer-wins':      '💀  Dealer wins.',
    'push':             '🤝  Push — it\'s a tie!',
  };
  const msg = state.outcome ? messages[state.outcome] : 'Game over.';
  console.log(`\n  ${msg}\n`);
};

// Closure: creates a readline interface once and reuses it across prompts.
// This demonstrates a closure — the `rl` instance is captured in the closure.
const createPrompt = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  const close = (): void => rl.close();

  return { ask, close };
};

// Recursive async game loop — runs until the game reaches 'finished'.
// Uses recursion instead of a while-loop to stay in the FP spirit.
export const gameLoop = async (
  state: GameState,
  prompt: ReturnType<typeof createPrompt>
): Promise<void> => {
  if (state.phase === 'finished') {
    displayOutcome(state);
    prompt.close();
    return;
  }

  displayState(state);
  const answer = await prompt.ask('\n  Hit or Stand? [h/s]: ');
  const normalized = answer.trim().toLowerCase();

  if (normalized === 'h' || normalized === 'hit') {
    return gameLoop(playerHit(state), prompt);
  }

  if (normalized === 's' || normalized === 'stand') {
    return gameLoop(playerStand(state), prompt);
  }

  // Unknown input: ask again (tail recursion).
  console.log('  Please enter h (hit) or s (stand).');
  return gameLoop(state, prompt);
};

// Entry point for I/O — wires the prompt into the loop.
export const startGame = async (initialState: GameState): Promise<void> => {
  const prompt = createPrompt();
  await gameLoop(initialState, prompt);
};
