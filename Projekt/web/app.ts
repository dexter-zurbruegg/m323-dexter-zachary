/// <reference path="types.ts" />
/// <reference path="deck.ts" />
/// <reference path="ui.ts" />
/// <reference path="blackjack.ts" />
/// <reference path="poker.ts" />

let pendingGame: 'blackjack' | 'poker' = 'blackjack';

const openBettingModal = (game: 'blackjack' | 'poker'): void => {
  pendingGame = game;
  const balance = getBalance();
  const input = getElement<HTMLInputElement>('bet-input');
  input.max = String(balance);
  input.value = String(Math.min(50, balance));
  getElement('bet-max-label').textContent = `Balance: $${balance}  ·  Max bet: $${balance}`;
  getElement('bet-value').textContent = `$${input.value}`;
  getElement('bet-modal').classList.add('open');
};

document.addEventListener('DOMContentLoaded', () => {
  updateBalanceDisplays();

  getElement('play-blackjack').addEventListener('click', () => {
    if (getBalance() <= 0) { alert('No chips left! Resetting to $1000.'); saveBalance(1000); updateBalanceDisplays(); }
    openBettingModal('blackjack');
  });

  getElement('play-poker').addEventListener('click', () => {
    if (getBalance() <= 0) { alert('No chips left! Resetting to $1000.'); saveBalance(1000); updateBalanceDisplays(); }
    openBettingModal('poker');
  });

  getElement('reset-balance').addEventListener('click', () => {
    if (confirm('Reset balance to $1000?')) { saveBalance(1000); updateBalanceDisplays(); }
  });

  getElement<HTMLInputElement>('bet-input').addEventListener('input', () => {
    getElement('bet-value').textContent = `$${getElement<HTMLInputElement>('bet-input').value}`;
  });

  getElement('bet-confirm').addEventListener('click', () => {
    const bet = parseInt(getElement<HTMLInputElement>('bet-input').value, 10);
    if (isNaN(bet) || bet <= 0 || bet > getBalance()) { alert('Invalid bet!'); return; }
    getElement('bet-modal').classList.remove('open');
    if (pendingGame === 'blackjack') { switchToScreen('blackjack'); startBlackjackGame(bet); }
    else { switchToScreen('poker'); startPokerGame(bet); }
  });

  getElement('bet-cancel').addEventListener('click', () =>
    getElement('bet-modal').classList.remove('open')
  );

  getElement('bj-hit').addEventListener('click', onPlayerHit);
  getElement('bj-stand').addEventListener('click', onPlayerStand);
  getElement('bj-back').addEventListener('click', () => switchToScreen('lobby'));
  getElement('bj-lobby-btn').addEventListener('click', () => switchToScreen('lobby'));

  getElement('poker-draw').addEventListener('click', onPlayerDraw);
  getElement('poker-back').addEventListener('click', () => switchToScreen('lobby'));
  getElement('poker-lobby-btn').addEventListener('click', () => switchToScreen('lobby'));
});
