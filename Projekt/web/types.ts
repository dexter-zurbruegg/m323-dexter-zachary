type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'A';
type Card = { suit: Suit; rank: Rank };

type PokerHandRank =
  | 'Royal Flush' | 'Straight Flush' | 'Four of a Kind'
  | 'Full House'  | 'Flush'          | 'Straight'
  | 'Three of a Kind' | 'Two Pair'   | 'One Pair' | 'High Card';

type GameScreen = 'lobby' | 'blackjack' | 'poker';

type RenderHandOptions = {
  faceDown?: boolean;
  clickable?: boolean;
  selected?: number[];
  onSelect?: (index: number) => void;
};

type BlackjackPhase   = 'player-turn' | 'finished';
type BlackjackOutcome = 'player-blackjack' | 'player-wins' | 'dealer-wins' | 'push';
type BlackjackState   = {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  phase: BlackjackPhase;
  outcome?: BlackjackOutcome;
  bet: number;
};

type PokerPhase  = 'draw' | 'result';
type PokerWinner = 'player' | 'computer' | 'tie';
type PokerState  = {
  deck: Card[];
  playerHand: Card[];
  computerHand: Card[];
  phase: PokerPhase;
  selectedDiscards: number[];
  playerHandRank?: PokerHandRank;
  computerHandRank?: PokerHandRank;
  winner?: PokerWinner;
  bet: number;
};
