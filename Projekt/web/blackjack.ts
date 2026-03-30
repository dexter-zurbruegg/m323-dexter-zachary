/// <reference path="types.ts" />
/// <reference path="deck.ts" />
/// <reference path="ui.ts" />

const blackjackCardValue = (card: Card): number =>
  card.rank === 'A' ? 11 : ['J','Q','K'].includes(card.rank) ? 10 : Number(card.rank);

const calculateBlackjackScore = (hand: Card[]): number => {
  const total    = hand.reduce((sum, card) => sum + blackjackCardValue(card), 0);
  const aceCount = hand.filter(card => card.rank === 'A').length;
  return Array.from({ length: aceCount }).reduce<number>(
    score => (score > 21 ? score - 10 : score), total
  );
};

let blackjackState: BlackjackState | null = null;

const runDealerTurn = (state: BlackjackState): BlackjackState => {
  if (calculateBlackjackScore(state.dealerHand) >= 17) return state;
  const [drawnCard, ...remainingDeck] = state.deck;
  if (!drawnCard) return state;
  return runDealerTurn({ ...state, deck: remainingDeck, dealerHand: [...state.dealerHand, drawnCard] });
};

const resolveBlackjackRound = (state: BlackjackState): BlackjackState => {
  const afterDealer = runDealerTurn(state);
  const playerScore = calculateBlackjackScore(afterDealer.playerHand);
  const dealerScore = calculateBlackjackScore(afterDealer.dealerHand);
  const outcome: BlackjackOutcome =
    afterDealer.playerHand.length === 2 && playerScore === 21 ? 'player-blackjack' :
    dealerScore > 21                                          ? 'player-wins' :
    playerScore > dealerScore                                 ? 'player-wins' :
    dealerScore > playerScore                                 ? 'dealer-wins' : 'push';
  return { ...afterDealer, phase: 'finished', outcome };
};

const renderBlackjack = (): void => {
  if (!blackjackState) return;
  const isRoundOver = blackjackState.phase === 'finished';

  renderHand('bj-dealer-hand', blackjackState.dealerHand, { faceDown: !isRoundOver });
  renderHand('bj-player-hand', blackjackState.playerHand);

  getElement('bj-player-score').textContent = `Score: ${calculateBlackjackScore(blackjackState.playerHand)}`;
  getElement('bj-dealer-score').textContent = isRoundOver ? `Score: ${calculateBlackjackScore(blackjackState.dealerHand)}` : '';
  getElement('bj-actions').style.display    = isRoundOver ? 'none' : 'flex';
  getElement('bj-new-game').style.display   = isRoundOver ? 'flex' : 'none';

  if (isRoundOver) {
    const outcomeMessages: Record<BlackjackOutcome, string> = {
      'player-blackjack': 'BLACKJACK! You win double!',
      'player-wins':      'You win!',
      'dealer-wins':      'Dealer wins.',
      'push':             'Tie!',
    };
    const outcome   = blackjackState.outcome ?? 'push';
    const messageEl = getElement('bj-message');
    messageEl.textContent = outcomeMessages[outcome];
    messageEl.className   = `outcome-msg ${outcome}`;
    if (outcome === 'player-blackjack') saveBalance(getBalance() + blackjackState.bet * 2);
    else if (outcome === 'player-wins') saveBalance(getBalance() + blackjackState.bet);
    else if (outcome === 'dealer-wins') saveBalance(getBalance() - blackjackState.bet);
    updateBalanceDisplays();
  } else {
    getElement('bj-message').textContent = `Bet: $${blackjackState.bet}`;
    getElement('bj-message').className   = 'message';
  }
};

const startBlackjackGame = (bet: number): void => {
  const shuffled                      = shuffleDeck(buildDeck());
  const [playerHand, afterPlayerDeal] = dealCards(shuffled, 2);
  const [dealerHand, remainingDeck]   = dealCards(afterPlayerDeal, 2);
  blackjackState = { deck: remainingDeck, playerHand, dealerHand, phase: 'player-turn', bet };
  renderBlackjack();
};

const onPlayerHit = (): void => {
  if (!blackjackState || blackjackState.phase !== 'player-turn') return;
  const [drawnCard, ...remainingDeck] = blackjackState.deck;
  if (!drawnCard) return;
  const playerHand = [...blackjackState.playerHand, drawnCard];
  blackjackState =
    calculateBlackjackScore(playerHand) > 21
      ? { ...blackjackState, deck: remainingDeck, playerHand, phase: 'finished', outcome: 'dealer-wins' }
      : calculateBlackjackScore(playerHand) === 21
        ? resolveBlackjackRound({ ...blackjackState, deck: remainingDeck, playerHand })
        : { ...blackjackState, deck: remainingDeck, playerHand };
  renderBlackjack();
};

const onPlayerStand = (): void => {
  if (!blackjackState || blackjackState.phase !== 'player-turn') return;
  blackjackState = resolveBlackjackRound(blackjackState);
  renderBlackjack();
};
