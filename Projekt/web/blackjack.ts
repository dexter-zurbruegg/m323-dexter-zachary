/// <reference path="types.ts" />
/// <reference path="deck.ts" />
/// <reference path="ui.ts" />

// pure function: returns the blackjack value of a single card
const cardValue = (card: Card): number => {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return Number(card.rank);
};

// pure function: calculates the best possible score for a hand
const calculatedBlackJackScore = (hand: Card[]): number => {
  const total = hand.reduce((sum, card) => sum + cardValue(card), 0);
  const aceCount = hand.filter(card => card.rank === 'A').length;
  return Array.from({ length: aceCount }).reduce<number>(
    score => (score > 21 ? score - 10 : score), total
  );
};

const scoreAtLeast = (minimum: number) => (hand: Card[]): boolean =>
  calculatedBlackJackScore(hand) >= minimum;

// using scoreAtLeast for a rule for the dealer
const dealerShouldStand = scoreAtLeast(17);

let blackjackState: BlackjackState | null = null;

// recursive function: dealer keeps drawing cards until dealerShouldStand returns true
// each call returns a new object
const runDealerTurn = (state: BlackjackState): BlackjackState => {
  if (dealerShouldStand(state.dealerHand)) return state;
  const [card, ...rest] = state.deck;
  if (!card) return state;
  return runDealerTurn({ ...state, deck: rest, dealerHand: [...state.dealerHand, card] });
};

// pure function: runs the dealer's turn, then determines who won
const resolveBlackjackRound = (state: BlackjackState): BlackjackState => {
  const after = runDealerTurn(state);
  const playerScore = calculatedBlackJackScore(after.playerHand);
  const dealerScore = calculatedBlackJackScore(after.dealerHand);

  let outcome: BlackjackOutcome;
  if (after.playerHand.length === 2 && playerScore === 21) outcome = 'player-blackjack';
  else if (dealerScore > 21) outcome = 'dealer-bust';
  else if (playerScore > dealerScore) outcome = 'player-wins';
  else if (dealerScore > playerScore) outcome = 'dealer-wins';
  else outcome = 'push';

  // spread creates a new object 
  return { ...after, phase: 'finished', outcome };
};

// side effect: reads blackjackState and updates the DOM
const renderBlackjack = (): void => {
  if (!blackjackState) return;
  const done = blackjackState.phase === 'finished';

  renderHand('bj-dealer-hand', blackjackState.dealerHand, { faceDown: !done });
  renderHand('bj-player-hand', blackjackState.playerHand);

  getElement('bj-player-score').textContent = `Score: ${calculatedBlackJackScore(blackjackState.playerHand)}`;
  getElement('bj-dealer-score').textContent = done ? `Score: ${calculatedBlackJackScore(blackjackState.dealerHand)}` : '';
  getElement('bj-actions').style.display = done ? 'none' : 'flex';
  getElement('bj-new-game').style.display = done ? 'flex' : 'none';

  if (done) {
    const messages: Record<BlackjackOutcome, string> = {
      'player-blackjack': 'BLACKJACK! You win double!',
      'player-wins': 'You win!',
      'dealer-bust': 'Dealer bust — you win!',
      'dealer-wins': 'Dealer wins.',
      'push': 'Tie!',
    };

    const outcome = blackjackState.outcome ?? 'push';
    const messageEl = getElement('bj-message');
    messageEl.textContent = messages[outcome];
    messageEl.className = `outcome-msg ${outcome}`;

    if (outcome === 'player-blackjack') saveBalance(getBalance() + blackjackState.bet * 2);
    else if (outcome === 'player-wins' || outcome === 'dealer-bust') saveBalance(getBalance() + blackjackState.bet);
    else if (outcome === 'dealer-wins') saveBalance(getBalance() - blackjackState.bet);

    updateBalanceDisplays();
  } else {
    getElement('bj-message').textContent = `Bet: $${blackjackState.bet}`;
    getElement('bj-message').className = 'message';
  }
};

const startBlackjackGame = (bet: number): void => {
  // function composition: build a fresh deck, shuffle it, then deal
  const shuffled = shuffleDeck(buildDeck());
  const [playerHand, afterPlayerDeal] = dealCards(shuffled, 2);
  const [dealerHand, remaining] = dealCards(afterPlayerDeal, 2);
  blackjackState = { deck: remaining, playerHand, dealerHand, phase: 'player-turn', bet };
  renderBlackjack();
};

const onPlayerHit = (): void => {
  if (!blackjackState || blackjackState.phase !== 'player-turn') return;
  const [card, ...rest] = blackjackState.deck;
  if (!card) return;

  const playerHand = [...blackjackState.playerHand, card];
  const score = calculatedBlackJackScore(playerHand);

  if (score > 21) {
    blackjackState = { ...blackjackState, deck: rest, playerHand, phase: 'finished', outcome: 'dealer-wins' };
  } else if (score === 21) {
    blackjackState = resolveBlackjackRound({ ...blackjackState, deck: rest, playerHand });
  } else {
    blackjackState = { ...blackjackState, deck: rest, playerHand };
  }

  renderBlackjack();
};

const onPlayerStand = (): void => {
  if (!blackjackState || blackjackState.phase !== 'player-turn') return;
  blackjackState = resolveBlackjackRound(blackjackState);
  renderBlackjack();
};
