/// <reference path="types.ts" />

const getElement = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

// builds the HTML element for a single card
const buildCardElement = (card: Card, faceDown = false): HTMLElement => {
  const div = document.createElement('div');
  div.className = 'card';

  if (faceDown) {
    div.classList.add('face-down');
    return div;
  }

  if (card.suit === '♥' || card.suit === '♦') {
    div.classList.add('red');
  }

  div.innerHTML = `
    <div class="card-corner top-left">${card.rank}<br>${card.suit}</div>
    <div class="card-big-suit">${card.suit}</div>
    <div class="card-corner bot-right">${card.rank}<br>${card.suit}</div>`;

  return div;
};

// HOF: renderHand accepts an onSelect callback, making it reusable for both clickable and display-only hands
// side effects are isolated here: this is the only place that touches the DOM for card rendering
const renderHand = (containerId: string, hand: Card[], options: RenderHandOptions = {}): void => {
  const container = getElement(containerId);
  container.innerHTML = '';

  hand.forEach((card, index) => {
    const cardElement = buildCardElement(card, options.faceDown);
    cardElement.style.animationDelay = `${index * 0.1}s`;

    if (options.selected?.includes(index)) cardElement.classList.add('selected-discard');

    if (options.clickable && options.onSelect) {
      cardElement.style.cursor = 'pointer';
      cardElement.addEventListener('click', () => options.onSelect!(index));
    }

    container.appendChild(cardElement);
  });
};

const BALANCE_KEY = 'casino_balance';

// side effect: reads from localStorage
const getBalance = (): number =>
  parseInt(localStorage.getItem(BALANCE_KEY) ?? '1000', 10);

// side effect: writes to localStorage
const saveBalance = (amount: number): void =>
  localStorage.setItem(BALANCE_KEY, String(Math.max(0, amount)));

// side effect: updates DOM
const updateBalanceDisplays = (): void => {
  document.querySelectorAll<HTMLElement>('.balance-display').forEach(display => {
    display.textContent = `💰 $${getBalance()}`;
  });
};

const switchToScreen = (screen: GameScreen): void => {
  document.querySelectorAll('.screen').forEach(element => element.classList.remove('active'));
  document.getElementById(`screen-${screen}`)?.classList.add('active');
};
