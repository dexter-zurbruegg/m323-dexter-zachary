/// <reference path="types.ts" />
/// <reference path="deck.ts" />
/// <reference path="ui.ts" />

// ascending rank order used by comparePokerHands
const POKER_RANKS: PokerHandRank[] = [
  'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
  'Straight', 'Flush', 'Full House', 'Four of a Kind',
  'Straight Flush', 'Royal Flush',
];

// pure function: maps a rank string to its numeric index in RANKS
const rankIndex = (rank: Rank): number => RANKS.indexOf(rank);

// pure function: evaluates the best poker hand rank
// uses map, filter, reduce (HOFs) to build sorted ranks, check flush/straight, count groups
const evaluatePokerHand = (hand: Card[]): PokerHandRank => {
  const sorted = [...hand].sort((a, b) => rankIndex(b.rank) - rankIndex(a.rank));
  const ranks = sorted.map(card => card.rank);
  const suits = sorted.map(card => card.suit);
  const indices = ranks.map(rankIndex);

  const isFlush = suits.every(suit => suit === suits[0]);
  const isStraight =
    indices.every((value, index) => index === 0 || value === indices[index - 1]! - 1) ||
    JSON.stringify(indices) === JSON.stringify([12, 3, 2, 1, 0]); // A-2-3-4-5 (wheel)

  // reduce builds a frequency map: { rank -> count }
  const rankCounts = ranks.reduce<Map<Rank, number>>(
    (map, rank) => map.set(rank, (map.get(rank) ?? 0) + 1), new Map()
  );
  const rankFrequencies = [...rankCounts.values()].sort((a, b) => b - a);

  if (isFlush && isStraight) return ranks[0] === 'A' && ranks[1] === 'K' ? 'Royal Flush' : 'Straight Flush';
  if (rankFrequencies[0] === 4) return 'Four of a Kind';
  if (rankFrequencies[0] === 3 && rankFrequencies[1] === 2) return 'Full House';
  if (isFlush) return 'Flush';
  if (isStraight) return 'Straight';
  if (rankFrequencies[0] === 3) return 'Three of a Kind';
  if (rankFrequencies[0] === 2 && rankFrequencies[1] === 2) return 'Two Pair';
  if (rankFrequencies[0] === 2) return 'One Pair';
  return 'High Card';
};

// pure function: compares two poker hand ranks, returns positive if a is better
const comparePokerHands = (a: PokerHandRank, b: PokerHandRank): number =>
  POKER_RANKS.indexOf(a) - POKER_RANKS.indexOf(b);

// pure function: decides which cards the computer should discard
// keeps all cards that are part of a pair or better, otherwise discards the 2 lowest-ranked
const selectAiDiscards = (hand: Card[]): number[] => {
  const rankCounts = hand.reduce<Map<Rank, number>>(
    (map, card) => map.set(card.rank, (map.get(card.rank) ?? 0) + 1), new Map()
  );
  const bestGroupSize = Math.max(...rankCounts.values());

  if (bestGroupSize >= 2) {
    // HOF: filter via reduce — keep only indices of unpaired cards
    return hand.reduce<number[]>(
      (discards, card, index) => rankCounts.get(card.rank)! < 2 ? [...discards, index] : discards, []
    );
  }

  // no pairs: discard the 2 weakest cards by rank
  return [...hand]
    .map((card, index) => ({ index, value: rankIndex(card.rank) }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(entry => entry.index);
};

let pokerState: PokerState | null = null;

// side effect: reads pokerState and updates the DOM
const renderPoker = (): void => {
  if (!pokerState) return;

  renderHand('poker-computer-hand', pokerState.computerHand, { faceDown: pokerState.phase !== 'result' });
  // passing an onSelect callback makes renderHand behave as a HOF here
  renderHand('poker-player-hand', pokerState.playerHand, {
    clickable: pokerState.phase === 'draw',
    selected: pokerState.selectedDiscards,
    onSelect: (index) => {
      // closure: this function captures pokerState from the outer scope
      if (!pokerState) return;
      const alreadySelected = pokerState.selectedDiscards.includes(index);
      // spread creates a new state object instead of mutating the existing one
      pokerState = {
        ...pokerState,
        selectedDiscards: alreadySelected
          ? pokerState.selectedDiscards.filter(discardIndex => discardIndex !== index)
          : [...pokerState.selectedDiscards, index],
      };
      renderPoker();
    },
  });

  getElement('poker-actions').style.display = pokerState.phase === 'draw' ? 'flex' : 'none';
  getElement('poker-result').style.display = pokerState.phase === 'result' ? 'block' : 'none';

  if (pokerState.phase === 'draw') {
    getElement('poker-message').textContent = `Bet: $${pokerState.bet}  |  Click cards to discard, then Draw`;
    getElement('poker-message').className = 'message';
  } else {
    const winnerMessages: Record<PokerWinner, string> = {
      player: 'You win!',
      computer: 'Computer wins.',
      tie: 'Tie!',
    };
    const winner = pokerState.winner ?? 'tie';
    const resultElement = getElement('poker-result');
    resultElement.textContent = `${winnerMessages[winner]}  ·  You: ${pokerState.playerHandRank}  vs  Computer: ${pokerState.computerHandRank}`;
    resultElement.className = `poker-result ${winner}`;
    getElement('poker-message').textContent = `Bet: $${pokerState.bet}`;
  }
};

const startPokerGame = (bet: number): void => {
  // function composition: build → shuffle → deal two hands
  const deck = shuffleDeck(buildDeck());
  const [playerHand, afterPlayerDeal] = dealCards(deck, 5);
  const [computerHand, remaining] = dealCards(afterPlayerDeal, 5);
  pokerState = { deck: remaining, playerHand, computerHand, phase: 'draw', selectedDiscards: [], bet };
  renderPoker();
};

const onPlayerDraw = (): void => {
  if (!pokerState || pokerState.phase !== 'draw') return;
  let remaining = [...pokerState.deck];

  // pure inner function: replaces discarded cards with new ones from the top of the remaining deck
  const replaceCards = (hand: Card[], discards: number[]): Card[] => {
    const updated = [...hand]; // spread copy — no mutation of the original hand
    for (const index of [...discards].sort((a, b) => b - a)) {
      const [card, ...rest] = remaining;
      if (!card) continue;
      updated[index] = card;
      remaining = rest;
    }
    return updated;
  };

  const playerHand = replaceCards(pokerState.playerHand, pokerState.selectedDiscards);
  const computerHand = replaceCards(pokerState.computerHand, selectAiDiscards(pokerState.computerHand));

  const playerHandRank = evaluatePokerHand(playerHand);
  const computerHandRank = evaluatePokerHand(computerHand);
  const comparison = comparePokerHands(playerHandRank, computerHandRank);
  const winner: PokerWinner = comparison > 0 ? 'player' : comparison < 0 ? 'computer' : 'tie';

  if (winner === 'player') saveBalance(getBalance() + pokerState.bet);
  if (winner === 'computer') saveBalance(getBalance() - pokerState.bet);
  updateBalanceDisplays();

  pokerState = {
    ...pokerState,
    deck: remaining, playerHand, computerHand,
    phase: 'result', selectedDiscards: [],
    playerHandRank, computerHandRank, winner,
  };
  renderPoker();
};
