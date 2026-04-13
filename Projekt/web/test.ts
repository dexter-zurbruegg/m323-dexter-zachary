/// <reference path="types.ts" />
/// <reference path="deck.ts" />
/// <reference path="blackjack.ts" />
/// <reference path="poker.ts" />

let failures = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
  } catch (e: any) {
    console.error(`❌ [FAIL] ${name}: ${e.message}`);
    failures++;
  }
}

function expect(actual: any, expected: any) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}

console.log('\n--- Running Automated Tests ---');

test('Pure function: buildDeck creates 52 cards', () => {
  const deck = buildDeck();
  expect(deck.length, 52);

  // First card should be 2 of Spades
  expect(deck[0]?.suit, '♠');
  expect(deck[0]?.rank, '2');
});

test('Pure function: dealCards splits the deck purely', () => {
  const deck = buildDeck();
  const [hand, remaining] = dealCards(deck, 5);
  expect(hand.length, 5);
  expect(remaining.length, 47);
  expect(deck.length, 52); // Original string is unaffected
});

test('Pure function: calculatedBlackJackScore calculates correctly without Aces', () => {
  const hand: Card[] = [{ suit: '♥', rank: '10' }, { suit: '♣', rank: '7' }];
  expect(calculatedBlackJackScore(hand), 17);
});

test('Pure function: calculatedBlackJackScore handles Ace as 11 and 1', () => {
  // Ace counts as 11
  const hand1: Card[] = [{ suit: '♥', rank: 'A' }, { suit: '♣', rank: '9' }];
  expect(calculatedBlackJackScore(hand1), 20);

  // Ace counts as 1 to avoid bust
  const hand2: Card[] = [{ suit: '♥', rank: 'A' }, { suit: '♣', rank: '9' }, { suit: '♦', rank: '8' }];
  expect(calculatedBlackJackScore(hand2), 18);

  // Multiple aces
  const hand3: Card[] = [{ suit: '♥', rank: 'A' }, { suit: '♣', rank: 'A' }, { suit: '♦', rank: 'A' }];
  expect(calculatedBlackJackScore(hand3), 13); // 11 + 1 + 1
});

test('Pure function: evaluatePokerHand evaluates hands ranking accurately', () => {
  const flush: Card[] = [
    { suit: '♠', rank: '2' },
    { suit: '♠', rank: '5' },
    { suit: '♠', rank: '9' },
    { suit: '♠', rank: 'J' },
    { suit: '♠', rank: 'A' }
  ];
  expect(evaluatePokerHand(flush), 'Flush');

  const twoPair: Card[] = [
    { suit: '♠', rank: 'K' },
    { suit: '♥', rank: 'K' },
    { suit: '♠', rank: '5' },
    { suit: '♦', rank: '5' },
    { suit: '♠', rank: 'A' }
  ];
  expect(evaluatePokerHand(twoPair), 'Two Pair');

  const fullHouse: Card[] = [
    { suit: '♠', rank: 'K' }, { suit: '♥', rank: 'K' }, { suit: '♦', rank: 'K' },
    { suit: '♣', rank: '2' }, { suit: '♠', rank: '2' }
  ];
  expect(evaluatePokerHand(fullHouse), 'Full House');
});

console.log('-------------------------------\n');

if (failures > 0) {
  throw new Error(`${failures} test(s) failed!`);
}
