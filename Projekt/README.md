# Casino Royale — Blackjack & Poker

A browser-based casino game built for the M323 Functional Programming module. It demonstrates core FP concepts through two playable games: **Blackjack** and **5-Card Draw Poker**.

---

## Setup

```bash
cd Projekt
npm install
```

Open `web/index.html` in your browser — `web/app.js` is already compiled and ready.

**Recompile after changing any `.ts` file:**
```bash
npm run build
```

---

## Features

- **Blackjack** — Hit or Stand against a dealer that follows the standard casino rule (draw until ≥ 17). Blackjack (Ace + face card) pays double.
- **5-Card Draw Poker** — Select cards to discard, draw replacements, and compete against a computer opponent with a rule-based AI.
- **Persistent balance** — Your chip balance is stored in `localStorage` across sessions.
- **Betting modal** — Choose your bet before each round; balance is updated automatically.

---

## File Structure

| File | Purpose |
|---|---|
| `web/types.ts` | All shared TypeScript types |
| `web/deck.ts` | Pure deck functions |
| `web/ui.ts` | DOM helpers, balance, navigation |
| `web/blackjack.ts` | Blackjack logic and rendering |
| `web/poker.ts` | Poker logic and rendering |
| `web/app.ts` | Bet modal and event wiring (entry point) |
| `web/index.html` | HTML structure |
| `web/style.css` | Styling |

All `.ts` files are compiled into a single `web/app.js` via `web/tsconfig.json` using `outFile` and `/// <reference path>` directives.

---

## Architecture & FP Design Choices

The project is structured around a strict separation between **pure logic** and **side effects**.

### Pure functions (no side effects)

All game logic functions are pure — given the same input they always return the same output and never touch the DOM, `localStorage`, or any global variable.

Examples: `buildDeck`, `shuffleDeck`, `dealCards`, `cardValue`, `calculatedBlackJackScore`, `scoreAtLeast`, `runDealerTurn`, `resolveBlackjackRound`, `evaluatePokerHand`, `comparePokerHands`, `selectAiDiscards`.

### Side effects isolated at the boundary

All DOM reads/writes and `localStorage` access are contained in `ui.ts` and the `render*` functions. The rest of the code never touches the DOM directly.

### Immutability

State is never mutated. Every update returns or assigns a new object using the spread operator:

```typescript
// old state is untouched — a new object is returned
return { ...state, deck: remainingDeck, dealerHand: [...state.dealerHand, card] };
```

Arrays are copied with `[...array]` before any modification (e.g. in `shuffleDeck` and `replaceCards`).

### Higher-order functions

Custom HOFs are defined to solve the problem, not just borrowed from the standard library:

- **`scoreAtLeast(minimum)`** — takes a number and returns a function that tests whether a hand reaches that score. Used to create `dealerShouldStand = scoreAtLeast(17)`, which is then passed to the recursive dealer logic.
- **`renderHand(..., options)`** — accepts an `onSelect` callback, making it reusable for both display-only and interactive card rendering.
- Built-in HOFs (`map`, `filter`, `reduce`, `every`, `flatMap`) are used throughout for card transforms, score calculation, and hand evaluation.

### Function composition

Small, focused functions are chained into clear pipelines:

```typescript
// blackjack.ts — compose a named rule from a HOF
const dealerShouldStand = scoreAtLeast(17);

// startBlackjackGame — build → shuffle → deal
const shuffled = shuffleDeck(buildDeck());
const [playerHand, afterPlayerDeal] = dealCards(shuffled, 2);
const [dealerHand, remaining]       = dealCards(afterPlayerDeal, 2);
```

### Recursion and closures

- **`runDealerTurn`** is recursive — it calls itself with a new state on every draw and only returns when `dealerShouldStand` is satisfied.
- **`scoreAtLeast`** returns a closure — the inner function captures the `minimum` variable from its outer scope.
- **`onSelect`** in `renderPoker` is a closure — it captures the `pokerState` variable and updates it when the user clicks a card.

### Type safety

Union types drive the design — invalid states are unrepresentable:

```typescript
type BlackjackOutcome = 'player-blackjack' | 'player-wins' | 'dealer-bust' | 'dealer-wins' | 'push';
type PokerHandRank    = 'Royal Flush' | 'Straight Flush' | ... | 'High Card';
type Suit             = '♠' | '♥' | '♦' | '♣';
```

TypeScript's `Record<BlackjackOutcome, string>` ensures every outcome has a matching message at compile time.

---

## Testing

### Automated Tests

A lightweight, dependency-free test script (`web/test.ts`) verifies the core pure functions (like calculating complex Blackjack scores with Aces, or evaluating Poker hand ranks).

To run the test suite:
```bash
npm run test
```

It contains assertions testing 5 key scenarios for our pure functions:

- Evaluates if buildDeck creates exactly 52 valid cards.

- Evaluates if dealCards splits the deck correctly without mutating the original deck string.

- Evaluates calculatedBlackJackScore with standard cards.

- Evaluates calculatedBlackJackScore correctly parsing Aces (treating them as 11 or 1 to prevent bust).

- Evaluates evaluatePokerHand using a sample Flush, Full House, and Two Pair logic.


### Manual Verification

The following scenarios cover all interactive critical paths and should be verified manually by opening `web/index.html` in a browser.

### Blackjack

| Scenario | How to trigger | Expected result |
|---|---|---|
| Player blackjack | Get dealt Ace + 10/J/Q/K as first two cards | "BLACKJACK! You win double!" — bet paid 2× |
| Player bust | Keep hitting until score > 21 | "Dealer wins." — round ends immediately |
| Dealer bust | Stand with a valid hand; dealer draws past 21 | "Dealer bust — you win!" |
| Player wins | Stand with higher score than dealer | "You win!" |
| Dealer wins | Stand with lower score than dealer | "Dealer wins." |
| Push | Both end with equal score | "Tie!" — balance unchanged |
| Dealer stands at 17 | Stand; watch dealer draw | Dealer stops at exactly 17 or above |
| Balance updates | Win or lose a round | Balance in header reflects the outcome immediately |

### Poker

| Scenario | How to trigger | Expected result |
|---|---|---|
| Player wins | End up with a higher hand rank than computer | "You win!" — balance increases |
| Computer wins | End up with a lower hand rank | "Computer wins." — balance decreases |
| Tie | Identical hand ranks | "Tie!" — balance unchanged |
| Discard and draw | Click cards to select/deselect, then Draw | Selected cards are replaced; computer also draws |
| AI strategy | Observe computer's discards in result | Computer keeps paired cards and discards lone low cards |
| Hand labels | Check result line | Both hands display correct rank (e.g. "Full House", "Flush") |

### Balance & Navigation

| Scenario | How to trigger | Expected result |
|---|---|---|
| Balance persists | Refresh the page after winning/losing | Balance is restored from `localStorage` |
| Reset balance | Click "Reset" in lobby | Balance returns to $1000 |
| Zero balance | Lose all chips | Alert fires and balance resets to $1000 before next game |
| Bet validation | Enter 0 or more than balance | "Invalid bet!" alert — game does not start |

---

## Game Rules

### Blackjack
- Player and dealer each receive 2 cards. One dealer card stays hidden.
- **Hit** — draw a card. **Stand** — end your turn.
- Exceeding 21 = instant loss.
- Dealer draws until reaching 17 or higher.
- Highest score wins. Equal scores = push (tie).
- Ace + 10-value card on the opening deal = Blackjack (pays double).

### 5-Card Draw Poker
- Both player and computer receive 5 cards (computer's hand is hidden).
- Click cards to mark them for discard, then click **Draw** to replace them.
- Computer keeps pairs or better; otherwise discards the 2 lowest-ranked cards.
- Hands are compared by standard poker rankings (Royal Flush → High Card).
- Higher-ranked hand wins. Equal ranks = tie.
