# Casino Royale — Blackjack & Poker

A functional-programming casino game for the M323 module. Includes **Blackjack** and **5-Card Draw Poker** playable in the browser.

---

## Setup & Run

```bash
cd Projekt
npm install
```

Open `web/index.html` in your browser — `web/app.js` is already compiled and ready.

**Recompile after making changes to `web/app.ts`:**
```bash
npm run build
```

---

## How It Works

The entire game logic lives in `web/app.ts`, compiled to `web/app.js` by `web/tsconfig.json`.

### File Overview

| File | Purpose |
|---|---|
| `web/app.ts` | All game logic and UI wiring |
| `web/index.html` | HTML structure — lobby, blackjack screen, poker screen |
| `web/style.css` | Styling |
| `web/tsconfig.json` | TypeScript compiler config (strict, no modules) |

### Code Structure inside `app.ts`

The file is organised into clearly named sections:

| Section | Key Functions |
|---|---|
| **Deck** | `buildDeck`, `shuffleDeck`, `dealCards` |
| **Blackjack scoring** | `calculateBlackjackScore`, `blackjackCardValue` |
| **Poker evaluation** | `evaluatePokerHand`, `comparePokerHands`, `selectAiDiscards` |
| **DOM helpers** | `getElement`, `buildCardElement`, `renderHand` |
| **Balance** | `getBalance`, `saveBalance`, `updateBalanceDisplays` |
| **Navigation** | `switchToScreen` |
| **Blackjack game** | `startBlackjackGame`, `runDealerTurn`, `resolveBlackjackRound`, `renderBlackjack`, `onPlayerHit`, `onPlayerStand` |
| **Poker game** | `startPokerGame`, `renderPoker`, `onPlayerDraw` |
| **Boot** | `DOMContentLoaded` — wires all buttons to the functions above |

### Data Flow

**Blackjack:**
```
startBlackjackGame(bet)
  → buildDeck → shuffleDeck → dealCards   [pure — build initial state]
  → renderBlackjack()                      [display]
  → onPlayerHit / onPlayerStand            [player action]
      → resolveBlackjackRound()            [pure — runs dealer, picks winner]
          → runDealerTurn()                [recursive — draws until ≥17]
```

**Poker:**
```
startPokerGame(bet)
  → buildDeck → shuffleDeck → dealCards   [pure — deal 5 cards each]
  → renderPoker()                          [display, cards clickable]
  → onPlayerDraw()                         [replace selected discards]
      → evaluatePokerHand()               [pure — rank both hands]
      → comparePokerHands()               [pure — pick winner]
```

---

## Functional Programming Concepts

| Concept | Where |
|---|---|
| **Pure functions** | `buildDeck`, `shuffleDeck`, `calculateBlackjackScore`, `evaluatePokerHand`, `resolveBlackjackRound`, `runDealerTurn` — no side effects, no mutation |
| **Immutability** | All state updates use the spread operator `{ ...state, ... }` — original objects are never modified |
| **Higher-order functions** | `Array.map`, `filter`, `reduce` throughout; `renderHand` accepts an `onSelect` callback |
| **Function composition** | `buildDeck → shuffleDeck → dealCards` pipeline in `startBlackjackGame` / `startPokerGame` |
| **Recursion** | `runDealerTurn` calls itself until the dealer reaches 17 |
| **Closures** | `openBettingModal` closes over `pendingGameType`; `onSelect` in `renderHand` closes over `pokerState` |
| **Type safety** | Union types for `Suit`, `Rank`, `BlackjackOutcome`, `PokerHandRank`; `readonly` object shapes |

---

## Game Rules

### Blackjack
- Player and dealer each receive 2 cards. One dealer card stays face-down.
- **Hit** — draw another card. **Stand** — end your turn.
- Exceeding 21 = **instant loss**.
- Dealer draws until reaching **17 or higher**.
- Highest score without busting wins. Equal scores = **push** (tie).
- Ace + 10-value card on the opening deal = **Blackjack** (pays double).

### 5-Card Draw Poker
- Both player and computer receive 5 cards. Computer's hand is hidden.
- Click cards to **select discards**, then click **Draw** to replace them.
- Computer uses an AI strategy (keeps pairs or better; otherwise discards the 2 weakest cards).
- Hands are compared using standard poker rankings.
- Higher-ranked hand wins the bet. Equal ranks = **tie**.
