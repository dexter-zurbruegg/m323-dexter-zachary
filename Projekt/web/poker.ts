/// <reference path="types.ts" />
/// <reference path="deck.ts" />
/// <reference path="ui.ts" />

const POKER_HAND_RANKS: PokerHandRank[] = [
  'High Card','One Pair','Two Pair','Three of a Kind',
  'Straight','Flush','Full House','Four of a Kind',
  'Straight Flush','Royal Flush',
];

const rankIndex = (rank: Rank): number => RANKS.indexOf(rank);

const evaluatePokerHand = (hand: Card[]): PokerHandRank => {
  const sorted      = [...hand].sort((a, b) => rankIndex(b.rank) - rankIndex(a.rank));
  const ranks       = sorted.map(card => card.rank);
  const suits       = sorted.map(card => card.suit);
  const indices     = ranks.map(rankIndex);

  const isFlush    = suits.every(suit => suit === suits[0]);
  const isStraight =
    indices.every((value, i) => i === 0 || value === indices[i - 1]! - 1) ||
    JSON.stringify(indices) === JSON.stringify([12, 3, 2, 1, 0]);

  const rankCounts = ranks.reduce<Map<Rank, number>>(
    (map, rank) => map.set(rank, (map.get(rank) ?? 0) + 1), new Map()
  );
  const rankFrequencies = [...rankCounts.values()].sort((a, b) => b - a);

  if (isFlush && isStraight)
    return ranks[0] === 'A' && ranks[1] === 'K' ? 'Royal Flush' : 'Straight Flush';
  if (rankFrequencies[0] === 4) return 'Four of a Kind';
  if (rankFrequencies[0] === 3 && rankFrequencies[1] === 2) return 'Full House';
  if (isFlush) return 'Flush';
  if (isStraight) return 'Straight';
  if (rankFrequencies[0] === 3) return 'Three of a Kind';
  if (rankFrequencies[0] === 2 && rankFrequencies[1] === 2) return 'Two Pair';
  if (rankFrequencies[0] === 2) return 'One Pair';
  return 'High Card';
};

const comparePokerHands = (a: PokerHandRank, b: PokerHandRank): number =>
  POKER_HAND_RANKS.indexOf(a) - POKER_HAND_RANKS.indexOf(b);

const selectAiDiscards = (hand: Card[]): number[] => {
  const rankCounts = hand.reduce<Map<Rank, number>>(
    (map, card) => map.set(card.rank, (map.get(card.rank) ?? 0) + 1), new Map()
  );
  const bestGroupSize = Math.max(...rankCounts.values());
  if (bestGroupSize >= 2) return hand.reduce<number[]>(
    (discards, card, i) => (rankCounts.get(card.rank)! < 2 ? [...discards, i] : discards), []
  );
  return [...hand]
    .map((card, i) => ({ i, value: rankIndex(card.rank) }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 2)
    .map(entry => entry.i);
};

let pokerState: PokerState | null = null;

const renderPoker = (): void => {
  if (!pokerState) return;
  renderHand('poker-computer-hand', pokerState.computerHand, { faceDown: pokerState.phase !== 'result' });
  renderHand('poker-player-hand', pokerState.playerHand, {
    clickable: pokerState.phase === 'draw',
    selected:  pokerState.selectedDiscards,
    onSelect: (index) => {
      if (!pokerState) return;
      const alreadySelected = pokerState.selectedDiscards.includes(index);
      pokerState = {
        ...pokerState,
        selectedDiscards: alreadySelected
          ? pokerState.selectedDiscards.filter(i => i !== index)
          : [...pokerState.selectedDiscards, index],
      };
      renderPoker();
    },
  });

  getElement('poker-actions').style.display = pokerState.phase === 'draw'   ? 'flex'  : 'none';
  getElement('poker-result').style.display  = pokerState.phase === 'result' ? 'block' : 'none';

  if (pokerState.phase === 'draw') {
    getElement('poker-message').textContent = `Bet: $${pokerState.bet}  |  Click cards to discard, then Draw`;
    getElement('poker-message').className   = 'message';
  } else {
    const winnerMessages: Record<PokerWinner, string> = {
      player:   'You win!',
      computer: 'Computer wins.',
      tie:      'Tie!',
    };
    const winner        = pokerState.winner ?? 'tie';
    const resultElement = getElement('poker-result');
    resultElement.textContent = `${winnerMessages[winner]}  ·  You: ${pokerState.playerHandRank}  vs  Computer: ${pokerState.computerHandRank}`;
    resultElement.className   = `poker-result ${winner}`;
    getElement('poker-message').textContent = `Bet: $${pokerState.bet}`;
  }
};

const startPokerGame = (bet: number): void => {
  const shuffled                        = shuffleDeck(buildDeck());
  const [playerHand, afterPlayerDeal]   = dealCards(shuffled, 5);
  const [computerHand, remainingDeck]   = dealCards(afterPlayerDeal, 5);
  pokerState = { deck: remainingDeck, playerHand, computerHand, phase: 'draw', selectedDiscards: [], bet };
  renderPoker();
};

const onPlayerDraw = (): void => {
  if (!pokerState || pokerState.phase !== 'draw') return;
  let remainingDeck = [...pokerState.deck];

  const replaceAtIndices = (hand: Card[], discardIndices: number[]): Card[] => {
    const updatedHand = [...hand];
    for (const index of [...discardIndices].sort((a, b) => b - a)) {
      const [replacement, ...rest] = remainingDeck;
      if (!replacement) continue;
      updatedHand[index] = replacement;
      remainingDeck = rest;
    }
    return updatedHand;
  };

  const playerHand       = replaceAtIndices(pokerState.playerHand,   pokerState.selectedDiscards);
  const computerHand     = replaceAtIndices(pokerState.computerHand, selectAiDiscards(pokerState.computerHand));
  const playerHandRank   = evaluatePokerHand(playerHand);
  const computerHandRank = evaluatePokerHand(computerHand);
  const comparison       = comparePokerHands(playerHandRank, computerHandRank);
  const winner: PokerWinner = comparison > 0 ? 'player' : comparison < 0 ? 'computer' : 'tie';

  if (winner === 'player')   saveBalance(getBalance() + pokerState.bet);
  if (winner === 'computer') saveBalance(getBalance() - pokerState.bet);
  updateBalanceDisplays();

  pokerState = {
    ...pokerState,
    deck: remainingDeck, playerHand, computerHand,
    phase: 'result', selectedDiscards: [],
    playerHandRank, computerHandRank, winner,
  };
  renderPoker();
};
