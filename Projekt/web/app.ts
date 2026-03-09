// ============================================================
// app.ts — Casino Royale Web UI
// Blackjack + 5-Card Draw Poker
// Single-file global script (no ES module imports).
// Compiles via web/tsconfig.json → web/app.js
// ============================================================

// ── Types ───────────────────────────────────────────────────
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
type Card = { suit: Suit; rank: Rank };

type PokerHandRank =
  | 'Royal Flush' | 'Straight Flush' | 'Four of a Kind'
  | 'Full House'  | 'Flush'          | 'Straight'
  | 'Three of a Kind' | 'Two Pair'   | 'One Pair' | 'High Card';

// ── Deck pure functions ──────────────────────────────────────
const SUITS: Suit[] = ['♠','♥','♦','♣'];
const RANKS: Rank[] = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

const createDeck = (): Card[] =>
  SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));

const shuffle = (deck: Card[]): Card[] => {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j]!, d[i]!];
  }
  return d;
};

const dealN = (deck: Card[], n: number): [Card[], Card[]] =>
  [deck.slice(0, n), deck.slice(n)];

// ── Blackjack scoring ────────────────────────────────────────
const cardValue = (c: Card): number =>
  c.rank === 'A' ? 11 : ['J','Q','K'].includes(c.rank) ? 10 : Number(c.rank);

const calcScore = (hand: Card[]): number => {
  const base = hand.reduce((s, c) => s + cardValue(c), 0);
  const aces = hand.filter(c => c.rank === 'A').length;
  return Array.from({ length: aces }).reduce<number>(
    score => (score > 21 ? score - 10 : score), base
  );
};

// ── Poker evaluation ─────────────────────────────────────────
const HAND_RANK_ORDER: PokerHandRank[] = [
  'High Card','One Pair','Two Pair','Three of a Kind',
  'Straight','Flush','Full House','Four of a Kind',
  'Straight Flush','Royal Flush',
];

const rankIdx = (r: Rank): number => RANKS.indexOf(r);

const evalPokerHand = (hand: Card[]): PokerHandRank => {
  const sorted = [...hand].sort((a, b) => rankIdx(b.rank) - rankIdx(a.rank));
  const ranks  = sorted.map(c => c.rank);
  const suits  = sorted.map(c => c.suit);
  const idxs   = ranks.map(rankIdx);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight =
    idxs.every((v, i) => i === 0 || v === idxs[i - 1]! - 1) ||
    JSON.stringify(idxs) === JSON.stringify([12, 3, 2, 1, 0]); // wheel

  const counts = ranks.reduce<Map<Rank, number>>(
    (m, r) => m.set(r, (m.get(r) ?? 0) + 1), new Map()
  );
  const cv = [...counts.values()].sort((a, b) => b - a);

  if (isFlush && isStraight)
    return ranks[0] === 'A' && ranks[1] === 'K' ? 'Royal Flush' : 'Straight Flush';
  if (cv[0] === 4) return 'Four of a Kind';
  if (cv[0] === 3 && cv[1] === 2) return 'Full House';
  if (isFlush) return 'Flush';
  if (isStraight) return 'Straight';
  if (cv[0] === 3) return 'Three of a Kind';
  if (cv[0] === 2 && cv[1] === 2) return 'Two Pair';
  if (cv[0] === 2) return 'One Pair';
  return 'High Card';
};

const comparePoker = (a: PokerHandRank, b: PokerHandRank): number =>
  HAND_RANK_ORDER.indexOf(a) - HAND_RANK_ORDER.indexOf(b);

// Computer AI: keep paired-or-better cards; else discard 2 weakest
const aiDiscards = (hand: Card[]): number[] => {
  const counts = hand.reduce<Map<Rank, number>>(
    (m, c) => m.set(c.rank, (m.get(c.rank) ?? 0) + 1), new Map()
  );
  const max = Math.max(...counts.values());
  if (max >= 2) return hand.reduce<number[]>(
    (acc, c, i) => (counts.get(c.rank)! < 2 ? [...acc, i] : acc), []
  );
  return [...hand]
    .map((c, i) => ({ i, v: rankIdx(c.rank) }))
    .sort((a, b) => a.v - b.v)
    .slice(0, 2)
    .map(x => x.i);
};

// ── DOM helpers ──────────────────────────────────────────────
const el = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

const makeCard = (card: Card, faceDown = false): HTMLElement => {
  const div = document.createElement('div');
  div.className = 'card';
  if (faceDown) { div.classList.add('face-down'); return div; }
  const red = card.suit === '♥' || card.suit === '♦';
  if (red) div.classList.add('red');
  div.innerHTML = `
    <div class="card-corner top-left">${card.rank}<br>${card.suit}</div>
    <div class="card-big-suit">${card.suit}</div>
    <div class="card-corner bot-right">${card.rank}<br>${card.suit}</div>`;
  return div;
};

const renderCards = (
  containerId: string, hand: Card[],
  opts: { faceDown?: boolean; clickable?: boolean; selected?: number[]; onSelect?: (i: number) => void } = {}
): void => {
  const container = el(containerId);
  container.innerHTML = '';
  hand.forEach((card, i) => {
    const div = makeCard(card, opts.faceDown);
    div.style.animationDelay = `${i * 0.1}s`;
    if (opts.selected?.includes(i)) div.classList.add('selected-discard');
    if (opts.clickable && opts.onSelect) {
      div.style.cursor = 'pointer';
      div.addEventListener('click', () => opts.onSelect!(i));
    }
    container.appendChild(div);
  });
};

// ── Balance (localStorage) ───────────────────────────────────
const BAL_KEY = 'casino_balance';
const getBal  = (): number => parseInt(localStorage.getItem(BAL_KEY) ?? '1000', 10);
const setBal  = (n: number): void => localStorage.setItem(BAL_KEY, String(Math.max(0, n)));

const syncBalances = (): void =>
  document.querySelectorAll<HTMLElement>('.balance-display')
    .forEach(d => { d.textContent = `💰 $${getBal()}`; });

// ── Navigation ───────────────────────────────────────────────
type GameScreen = 'lobby' | 'blackjack' | 'poker';
const showScreen = (s: GameScreen): void => {
  document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
  document.getElementById(`screen-${s}`)?.classList.add('active');
};

// ══════════════════════════════════════════════════════════════
//  BLACKJACK
// ══════════════════════════════════════════════════════════════
type BJPhase = 'player-turn' | 'finished';
type BJOutcome = 'player-blackjack' | 'player-wins' | 'dealer-wins' | 'push';
type BJState = { deck: Card[]; player: Card[]; dealer: Card[]; phase: BJPhase; outcome?: BJOutcome; bet: number };

let bj: BJState | null = null;

const bjDealerPlay = (s: BJState): BJState => {
  if (calcScore(s.dealer) >= 17) return s;
  const [card, ...rest] = s.deck;
  if (!card) return s;
  return bjDealerPlay({ ...s, deck: rest, dealer: [...s.dealer, card] });
};

const bjResolve = (s: BJState): BJState => {
  const after = bjDealerPlay(s);
  const ps = calcScore(after.player), ds = calcScore(after.dealer);
  const o: BJOutcome =
    after.player.length === 2 && ps === 21 ? 'player-blackjack' :
    ds > 21 ? 'player-wins' :
    ps > ds ? 'player-wins' :
    ds > ps ? 'dealer-wins' : 'push';
  return { ...after, phase: 'finished', outcome: o };
};

const bjRender = (): void => {
  if (!bj) return;
  const fin = bj.phase === 'finished';

  renderCards('bj-dealer-hand', bj.dealer, { faceDown: !fin });
  renderCards('bj-player-hand', bj.player);

  el('bj-player-score').textContent = `Score: ${calcScore(bj.player)}`;
  el('bj-dealer-score').textContent = fin ? `Score: ${calcScore(bj.dealer)}` : '';
  el('bj-actions').style.display   = fin ? 'none' : 'flex';
  el('bj-new-game').style.display  = fin ? 'flex' : 'none';

  if (fin) {
    const msg: Record<BJOutcome, string> = {
      'player-blackjack': '🃏 BLACKJACK! You win double!',
      'player-wins':      '🎉 You win!',
      'dealer-wins':      '💀 Dealer wins.',
      'push':             '🤝 Push — tie!',
    };
    const o = bj.outcome ?? 'push';
    const msgEl = el('bj-message');
    msgEl.textContent = msg[o]; msgEl.className = `outcome-msg ${o}`;
    if (o === 'player-blackjack') setBal(getBal() + bj.bet * 2);
    else if (o === 'player-wins') setBal(getBal() + bj.bet);
    else if (o === 'dealer-wins') setBal(getBal() - bj.bet);
    syncBalances();
  } else {
    el('bj-message').textContent = `Bet: $${bj.bet}`;
    el('bj-message').className = 'message';
  }
};

const bjInit = (bet: number): void => {
  const deck = shuffle(createDeck());
  const [p, d1] = dealN(deck, 2);
  const [dealer, rest] = dealN(d1, 2);
  bj = { deck: rest, player: p, dealer, phase: 'player-turn', bet };
  bjRender();
};

const bjHit = (): void => {
  if (!bj || bj.phase !== 'player-turn') return;
  const [card, ...rest] = bj.deck; if (!card) return;
  const player = [...bj.player, card];
  bj = calcScore(player) > 21
    ? { ...bj, deck: rest, player, phase: 'finished', outcome: 'dealer-wins' }
    : calcScore(player) === 21
      ? bjResolve({ ...bj, deck: rest, player })
      : { ...bj, deck: rest, player };
  bjRender();
};

const bjStand = (): void => {
  if (!bj || bj.phase !== 'player-turn') return;
  bj = bjResolve(bj);
  bjRender();
};

// ══════════════════════════════════════════════════════════════
//  POKER
// ══════════════════════════════════════════════════════════════
type PokerPhase = 'draw' | 'result';
type PokerWinner = 'player' | 'computer' | 'tie';
type PokerState = {
  deck: Card[]; player: Card[]; computer: Card[];
  phase: PokerPhase; discards: number[];
  playerRank?: PokerHandRank; compRank?: PokerHandRank;
  winner?: PokerWinner; bet: number;
};

let pk: PokerState | null = null;

const pkRender = (): void => {
  if (!pk) return;
  renderCards('poker-computer-hand', pk.computer, { faceDown: pk.phase !== 'result' });
  renderCards('poker-player-hand', pk.player, {
    clickable: pk.phase === 'draw',
    selected: pk.discards,
    onSelect: (i) => {
      if (!pk) return;
      const already = pk.discards.includes(i);
      pk = { ...pk, discards: already ? pk.discards.filter(x => x !== i) : [...pk.discards, i] };
      pkRender();
    },
  });

  el('poker-actions').style.display  = pk.phase === 'draw'   ? 'flex' : 'none';
  el('poker-result').style.display   = pk.phase === 'result' ? 'block' : 'none';

  if (pk.phase === 'draw') {
    el('poker-message').textContent = `Bet: $${pk.bet}  |  Click cards to discard, then Draw`;
    el('poker-message').className = 'message';
  } else {
    const msgs: Record<PokerWinner, string> = {
      player:   '🎉 You win!',
      computer: '💀 Computer wins.',
      tie:      '🤝 Tie!',
    };
    const w = pk.winner ?? 'tie';
    const res = el('poker-result');
    res.textContent = `${msgs[w]}  ·  You: ${pk.playerRank}  vs  Computer: ${pk.compRank}`;
    res.className = `poker-result ${w}`;
    el('poker-message').textContent = `Bet: $${pk.bet}`;
  }
};

const pkInit = (bet: number): void => {
  const deck = shuffle(createDeck());
  const [player, d1] = dealN(deck, 5);
  const [computer, rest] = dealN(d1, 5);
  pk = { deck: rest, player, computer, phase: 'draw', discards: [], bet };
  pkRender();
};

const pkDraw = (): void => {
  if (!pk || pk.phase !== 'draw') return;
  let deck = [...pk.deck];
  const replaceAt = (hand: Card[], indices: number[]): Card[] => {
    const h = [...hand];
    for (const i of [...indices].sort((a, b) => b - a)) {
      const [card, ...rest] = deck; if (!card) continue;
      h[i] = card; deck = rest;
    }
    return h;
  };
  const player   = replaceAt(pk.player,   pk.discards);
  const computer = replaceAt(pk.computer, aiDiscards(pk.computer));
  const pRank = evalPokerHand(player);
  const cRank = evalPokerHand(computer);
  const cmp   = comparePoker(pRank, cRank);
  const winner: PokerWinner = cmp > 0 ? 'player' : cmp < 0 ? 'computer' : 'tie';

  if (winner === 'player')   setBal(getBal() + pk.bet);
  if (winner === 'computer') setBal(getBal() - pk.bet);
  syncBalances();

  pk = { ...pk, deck, player, computer, phase: 'result', discards: [], playerRank: pRank, compRank: cRank, winner };
  pkRender();
};

// ══════════════════════════════════════════════════════════════
//  BET MODAL
// ══════════════════════════════════════════════════════════════
let pendingGame: 'blackjack' | 'poker' = 'blackjack';

const openBetModal = (game: 'blackjack' | 'poker'): void => {
  pendingGame = game;
  const bal = getBal();
  const input = el<HTMLInputElement>('bet-input');
  input.max   = String(bal);
  input.value = String(Math.min(50, bal));
  el('bet-max-label').textContent = `Balance: $${bal}  ·  Max bet: $${bal}`;
  el('bet-value').textContent = `$${input.value}`;
  el('bet-modal').classList.add('open');
};

// ══════════════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  syncBalances();

  // Lobby
  el('play-blackjack').addEventListener('click', () => {
    if (getBal() <= 0) { alert('No chips left! Resetting to $1000.'); setBal(1000); syncBalances(); }
    openBetModal('blackjack');
  });
  el('play-poker').addEventListener('click', () => {
    if (getBal() <= 0) { alert('No chips left! Resetting to $1000.'); setBal(1000); syncBalances(); }
    openBetModal('poker');
  });
  el('reset-balance').addEventListener('click', () => {
    if (confirm('Reset balance to $1000?')) { setBal(1000); syncBalances(); }
  });

  // Bet modal
  el<HTMLInputElement>('bet-input').addEventListener('input', () => {
    el('bet-value').textContent = `$${el<HTMLInputElement>('bet-input').value}`;
  });
  el('bet-confirm').addEventListener('click', () => {
    const bet = parseInt(el<HTMLInputElement>('bet-input').value, 10);
    if (isNaN(bet) || bet <= 0 || bet > getBal()) { alert('Invalid bet!'); return; }
    el('bet-modal').classList.remove('open');
    if (pendingGame === 'blackjack') { showScreen('blackjack'); bjInit(bet); }
    else                             { showScreen('poker');     pkInit(bet); }
  });
  el('bet-cancel').addEventListener('click', () => el('bet-modal').classList.remove('open'));

  // Blackjack
  el('bj-hit').addEventListener('click', bjHit);
  el('bj-stand').addEventListener('click', bjStand);
  el('bj-back').addEventListener('click', () => showScreen('lobby'));
  el('bj-lobby-btn').addEventListener('click', () => showScreen('lobby'));

  // Poker
  el('poker-draw').addEventListener('click', pkDraw);
  el('poker-back').addEventListener('click', () => showScreen('lobby'));
  el('poker-lobby-btn').addEventListener('click', () => showScreen('lobby'));
});
