/// <reference path="types.ts" />

const getElement = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

const buildCardElement = (card: Card, faceDown = false): HTMLElement => {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  if (faceDown) { cardDiv.classList.add('face-down'); return cardDiv; }
  const isRedSuit = card.suit === '♥' || card.suit === '♦';
  if (isRedSuit) cardDiv.classList.add('red');
  cardDiv.innerHTML = `
    <div class="card-corner top-left">${card.rank}<br>${card.suit}</div>
    <div class="card-big-suit">${card.suit}</div>
    <div class="card-corner bot-right">${card.rank}<br>${card.suit}</div>`;
  return cardDiv;
};

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

const BALANCE_STORAGE_KEY = 'casino_balance';
const getBalance   = (): number  => parseInt(localStorage.getItem(BALANCE_STORAGE_KEY) ?? '1000', 10);
const saveBalance  = (amount: number): void => localStorage.setItem(BALANCE_STORAGE_KEY, String(Math.max(0, amount)));

const updateBalanceDisplays = (): void =>
  document.querySelectorAll<HTMLElement>('.balance-display')
    .forEach(display => { display.textContent = `💰 $${getBalance()}`; });

const switchToScreen = (screen: GameScreen): void => {
  document.querySelectorAll('.screen').forEach(element => element.classList.remove('active'));
  document.getElementById(`screen-${screen}`)?.classList.add('active');
};
